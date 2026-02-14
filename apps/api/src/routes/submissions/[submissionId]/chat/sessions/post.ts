import { OrchestratorV2, ConsoleLogger, type SessionForm } from '@ding/agent'
import { ChatSession, ChatMessage, SubmissionTask, EventLog } from '@ding/domain/domain/entity'
import {
  ChatSessionId,
  ChatMessageId,
  ChatMessageRole,
  SubmissionId,
  ChatSessionType,
  ChatSessionStatus,
  SubmissionTaskId,
  TodoStatus,
  EventLogId,
  EventType,
  AgentType as DomainAgentType,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  chatSessionResponseSchema,
  chatMessageResponseSchema,
  submissionTaskResponseSchema,
} from '../../../../../schemas/response'
import {
  serializeChatSession,
  serializeChatMessage,
  serializeSubmissionTask,
} from '../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{submissionId}/chat/sessions',
  operationId: 'createChatSession',
  tags: ['Chat'],
  summary: 'Create a new chat session for a submission',
  request: {
    params: z.object({
      submissionId: z.string(),
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
              todos: z.array(submissionTaskResponseSchema),
              greeting: chatMessageResponseSchema.nullable(),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Submission or Form not found',
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
  const { submissionId } = c.req.valid('param')

  // 1. Submission 取得
  const submissionResult = await repositories.submissionRepository.findById(
    SubmissionId.fromString(submissionId)
  )
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }
  const submission = submissionResult.value

  // 2. Form 取得
  const formResult = await repositories.formRepository.findById(submission.formId)
  if (!formResult.success) {
    return c.json({ error: 'Form not found' }, 404)
  }

  // 3. FormField 一覧
  const formFieldsResult = await repositories.formRepository.findFormFieldsByFormId(
    submission.formId
  )
  if (!formFieldsResult.success) {
    return c.json({ error: 'Failed to load form fields' }, 500)
  }
  const formFields = formFieldsResult.value

  // 4. FieldCompletionCriteria 一覧
  const criteriaResult = await repositories.formRepository.findCompletionCriteriaBySchemaVersionId(
    submission.schemaVersionId
  )
  if (!criteriaResult.success) {
    return c.json({ error: 'Failed to load completion criteria' }, 500)
  }
  const completionCriteria = criteriaResult.value

  // 5. ChatSession 作成
  const now = new Date()
  const sessionId = ChatSessionId.fromString(crypto.randomUUID())
  const session = ChatSession.create({
    id: sessionId,
    submissionId: submission.id,
    formId: submission.formId,
    type: ChatSessionType.formResponse(),
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

  // 6. SubmissionTask 作成（各 FieldCompletionCriteria から）
  const todos = completionCriteria.map((criteria) => {
    const formField = formFields.find((f) => f.id.equals(criteria.formFieldId))
    return SubmissionTask.create({
      id: SubmissionTaskId.fromString(crypto.randomUUID()),
      submissionId: submission.id,
      fieldCompletionCriteriaId: criteria.id,
      formFieldId: criteria.formFieldId,
      criteria: criteria.criteria,
      doneCondition: criteria.doneCondition,
      required: formField?.required ?? false,
      status: TodoStatus.pending(),
      collectedValue: null,
      createdAt: now,
      updatedAt: now,
    })
  })

  // 7. 保存
  const saveSessionResult = await repositories.submissionRepository.saveChatSession(session)
  if (!saveSessionResult.success) {
    return c.json({ error: 'Failed to save chat session' }, 500)
  }

  if (todos.length > 0) {
    const saveTodosResult = await repositories.submissionRepository.saveTasks(todos)
    if (!saveTodosResult.success) {
      return c.json({ error: 'Failed to save todos' }, 500)
    }
  }

  // 8. EventLog 記録
  const eventLog = EventLog.create({
    id: EventLogId.fromString(crypto.randomUUID()),
    formId: submission.formId,
    submissionId: submission.id,
    chatSessionId: sessionId,
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
      facts: completionCriteria.map((c) => ({
        id: c.id.value,
        jobFormFieldId: c.formFieldId.value,
        factKey: c.criteriaKey,
        fact: c.criteria,
        doneCriteria: c.doneCondition,
        questioningHints: c.questioningHints,
      })),
    }

    const result = await orchestrator.start(sessionId.value, form)

    // アシスタントメッセージを DB に保存
    const greetingMsg = ChatMessage.create({
      id: ChatMessageId.fromString(crypto.randomUUID()),
      chatSessionId: sessionId,
      role: ChatMessageRole.assistant(),
      content: result.responseText,
      targetFormFieldId: null,
      reviewPassed: null,
      createdAt: now,
    })
    await repositories.submissionRepository.saveChatMessage(greetingMsg)

    // currentAgent を更新
    const updatedSession = session.changeAgent(DomainAgentType.from(result.currentAgent))
    await repositories.submissionRepository.saveChatSession(updatedSession)

    greeting = serializeChatMessage(greetingMsg)
  } catch (error) {
    // 挨拶生成失敗時は greeting: null で返す
    console.error('Failed to generate greeting:', error)
  }

  return c.json(
    {
      data: {
        session: serializeChatSession(session),
        todos: todos.map(serializeSubmissionTask),
        greeting,
      },
    },
    201
  )
})

export default app
