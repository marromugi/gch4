import { OrchestratorV2, ConsoleLogger, type SessionForm } from '@ding/agent'
import { ChatSession, ChatMessage, ApplicationTodo, EventLog } from '@ding/domain/domain/entity'
import {
  ChatSessionId,
  ChatMessageId,
  ChatMessageRole,
  ApplicationId,
  ChatSessionType,
  ChatSessionStatus,
  ApplicationTodoId,
  TodoStatus,
  EventLogId,
  EventType,
  AgentType as DomainAgentType,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  chatSessionResponseSchema,
  chatMessageResponseSchema,
  applicationTodoResponseSchema,
} from '../../../../../schemas/response'
import {
  serializeChatSession,
  serializeChatMessage,
  serializeApplicationTodo,
} from '../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{applicationId}/chat/sessions',
  operationId: 'createChatSession',
  tags: ['Chat'],
  summary: 'Create a new chat session for an application',
  request: {
    params: z.object({
      applicationId: z.string(),
    }),
  },
  responses: {
    201: {
      description: 'Chat session created',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              session: chatSessionResponseSchema,
              todos: z.array(applicationTodoResponseSchema),
              greeting: chatMessageResponseSchema.nullable(),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Application or Job not found',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
})

const app = new OpenAPIHono<HonoEnv>()

app.openapi(route, async (c) => {
  const { repositories, infrastructure } = c.get('di')
  const { applicationId } = c.req.valid('param')

  // 1. Application 取得
  const appResult = await repositories.applicationRepository.findById(
    ApplicationId.fromString(applicationId)
  )
  if (!appResult.success) {
    return c.json({ error: 'Application not found' }, 404)
  }
  const application = appResult.value

  // 2. Job 取得
  const jobResult = await repositories.jobRepository.findById(application.jobId)
  if (!jobResult.success) {
    return c.json({ error: 'Job not found' }, 404)
  }
  // jobResult.value は現在使用していないが、存在確認は完了

  // 3. FormField 一覧
  const formFieldsResult = await repositories.jobRepository.findFormFieldsByJobId(application.jobId)
  if (!formFieldsResult.success) {
    return c.json({ error: 'Failed to load form fields' }, 500)
  }
  const formFields = formFieldsResult.value

  // 4. FieldFactDefinition 一覧
  const factDefsResult = await repositories.jobRepository.findFactDefinitionsBySchemaVersionId(
    application.schemaVersionId
  )
  if (!factDefsResult.success) {
    return c.json({ error: 'Failed to load fact definitions' }, 500)
  }
  const factDefinitions = factDefsResult.value

  // 5. ChatSession 作成
  const now = new Date()
  const sessionId = ChatSessionId.fromString(crypto.randomUUID())
  const session = ChatSession.create({
    id: sessionId,
    applicationId: application.id,
    jobId: application.jobId,
    policyVersionId: null,
    type: ChatSessionType.application(),
    conductorId: null,
    bootstrapCompleted: false,
    status: ChatSessionStatus.active(),
    turnCount: 0,
    softCap: null,
    hardCap: null,
    softCappedAt: null,
    hardCappedAt: null,
    reviewFailStreak: 0,
    extractionFailStreak: 0,
    timeoutStreak: 0,
    currentAgent: DomainAgentType.greeter(),
    plan: null,
    planSchemaVersion: null,
    createdAt: now,
    updatedAt: now,
  })

  // 6. ApplicationTodo 作成（各 FieldFactDefinition から）
  const todos = factDefinitions.map((def) => {
    const formField = formFields.find((f) => f.id.equals(def.jobFormFieldId))
    return ApplicationTodo.create({
      id: ApplicationTodoId.fromString(crypto.randomUUID()),
      applicationId: application.id,
      fieldFactDefinitionId: def.id,
      jobFormFieldId: def.jobFormFieldId,
      fact: def.fact,
      doneCriteria: def.doneCriteria,
      required: formField?.required ?? false,
      status: TodoStatus.pending(),
      extractedValue: null,
      createdAt: now,
      updatedAt: now,
    })
  })

  // 7. 保存
  const saveSessionResult = await repositories.applicationRepository.saveChatSession(session)
  if (!saveSessionResult.success) {
    return c.json({ error: 'Failed to save chat session' }, 500)
  }

  if (todos.length > 0) {
    const saveTodosResult = await repositories.applicationRepository.saveTodos(todos)
    if (!saveTodosResult.success) {
      return c.json({ error: 'Failed to save todos' }, 500)
    }
  }

  // 8. EventLog 記録
  const eventLog = EventLog.create({
    id: EventLogId.fromString(crypto.randomUUID()),
    jobId: application.jobId,
    applicationId: application.id,
    chatSessionId: sessionId,
    policyVersionId: null,
    eventType: EventType.chatStarted(),
    metadata: null,
    createdAt: now,
  })
  await repositories.eventLogRepository.create(eventLog)

  // 9. 挨拶メッセージ生成（OrchestratorV2 使用）
  let greeting: ReturnType<typeof serializeChatMessage> | null = null
  try {
    const logger = new ConsoleLogger('[OrchestratorV2]')
    const orchestrator = new OrchestratorV2({
      kvStore: infrastructure.kvStore,
      registry: infrastructure.agentRegistry,
      provider: infrastructure.llmProvider,
      logger,
    })

    // フォーム情報を構築
    const form: SessionForm = {
      fields: formFields.map((f) => ({
        id: f.id.value,
        fieldId: f.fieldId,
        label: f.label,
        intent: f.intent,
        required: f.required,
        sortOrder: f.sortOrder,
      })),
      facts: factDefinitions.map((d) => ({
        id: d.id.value,
        jobFormFieldId: d.jobFormFieldId.value,
        factKey: d.factKey,
        fact: d.fact,
        doneCriteria: d.doneCriteria,
        questioningHints: d.questioningHints,
      })),
    }

    const result = await orchestrator.start(sessionId.value, form)

    // アシスタントメッセージを DB に保存
    const greetingMsg = ChatMessage.create({
      id: ChatMessageId.fromString(crypto.randomUUID()),
      chatSessionId: sessionId,
      role: ChatMessageRole.assistant(),
      content: result.responseText,
      targetJobFormFieldId: null,
      targetReviewSignalId: null,
      reviewPassed: null,
      createdAt: now,
    })
    await repositories.applicationRepository.saveChatMessage(greetingMsg)

    // currentAgent を更新
    const updatedSession = session.changeAgent(DomainAgentType.from(result.currentAgent))
    await repositories.applicationRepository.saveChatSession(updatedSession)

    greeting = serializeChatMessage(greetingMsg)
  } catch (error) {
    // 挨拶生成失敗時は greeting: null で返す（従来通りの動作）
    console.error('Failed to generate greeting:', error)
  }

  return c.json(
    {
      data: {
        session: serializeChatSession(session),
        todos: todos.map(serializeApplicationTodo),
        greeting,
      },
    },
    201
  )
})

export default app
