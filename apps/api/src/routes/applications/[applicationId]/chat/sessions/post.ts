import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ApplicationAgent } from '@ding/agent'
import { ChatSession } from '@ding/domain/domain/entity'
import { ChatMessage } from '@ding/domain/domain/entity'
import { ApplicationTodo } from '@ding/domain/domain/entity'
import { EventLog } from '@ding/domain/domain/entity'
import { ChatSessionId } from '@ding/domain/domain/valueObject'
import { ChatMessageId } from '@ding/domain/domain/valueObject'
import { ChatMessageRole } from '@ding/domain/domain/valueObject'
import { ApplicationId } from '@ding/domain/domain/valueObject'
import { ChatSessionType } from '@ding/domain/domain/valueObject'
import { ChatSessionStatus } from '@ding/domain/domain/valueObject'
import { ApplicationTodoId } from '@ding/domain/domain/valueObject'
import { TodoStatus } from '@ding/domain/domain/valueObject'
import { EventLogId } from '@ding/domain/domain/valueObject'
import { EventType } from '@ding/domain/domain/valueObject'
import type { HonoEnv } from '../../../../../types/hono'
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
import { buildAgentContext } from './[sessionId]/messages/buildAgentContext'

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
  const job = jobResult.value

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

  // 9. 挨拶メッセージ生成
  let greeting: ReturnType<typeof serializeChatMessage> | null = null
  try {
    const agentContext = buildAgentContext({
      application,
      job,
      session,
      messages: [],
      todos,
      formFields,
      factDefinitions: factDefsResult.value,
      prohibitedTopics: [],
    })

    const agent = new ApplicationAgent(infrastructure.llmProvider, {
      logDir: c.env.AGENT_LOG_DIR,
    })
    const greetingResult = await agent.generateGreeting(agentContext)

    // アシスタントメッセージのみ DB に保存
    const greetingMsg = ChatMessage.create({
      id: ChatMessageId.fromString(crypto.randomUUID()),
      chatSessionId: sessionId,
      role: ChatMessageRole.assistant(),
      content: greetingResult.responseText,
      targetJobFormFieldId: null,
      targetReviewSignalId: null,
      reviewPassed: null,
      createdAt: now,
    })
    await repositories.applicationRepository.saveChatMessage(greetingMsg)

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
