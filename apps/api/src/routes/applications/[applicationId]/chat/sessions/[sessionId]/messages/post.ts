import { OrchestratorV2, ConsoleLogger } from '@ding/agent'
import { ChatMessage } from '@ding/domain/domain/entity'
import {
  ApplicationId,
  ChatSessionId,
  ChatMessageId,
  ChatMessageRole,
  AgentType as DomainAgentType,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  chatMessageResponseSchema,
  chatSessionResponseSchema,
  applicationTodoResponseSchema,
} from '../../../../../../../schemas/response'
import {
  serializeChatMessage,
  serializeChatSession,
  serializeApplicationTodo,
} from '../../../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{applicationId}/chat/sessions/{sessionId}/messages',
  operationId: 'sendChatMessage',
  tags: ['Chat'],
  summary: 'Send a message in a chat session',
  request: {
    params: z.object({
      applicationId: z.string(),
      sessionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message processed',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              message: chatMessageResponseSchema.optional(),
              session: chatSessionResponseSchema,
              todos: z.array(applicationTodoResponseSchema),
              phase: z.enum(['bootstrap', 'questioning', 'fallback', 'wrapup']),
              isComplete: z.boolean(),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Not found',
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
  const { applicationId, sessionId } = c.req.valid('param')
  const body = c.req.valid('json')

  const appId = ApplicationId.fromString(applicationId)
  const sessId = ChatSessionId.fromString(sessionId)

  // 1. Application 取得
  const appResult = await repositories.applicationRepository.findById(appId)
  if (!appResult.success) {
    return c.json({ error: 'Application not found' }, 404)
  }
  const _application = appResult.value

  // 2. セッション取得
  const sessionsResult =
    await repositories.applicationRepository.findChatSessionsByApplicationId(appId)
  if (!sessionsResult.success) {
    return c.json({ error: 'Failed to load sessions' }, 500)
  }
  const session = sessionsResult.value.find((s) => s.id.equals(sessId))
  if (!session) {
    return c.json({ error: 'Chat session not found' }, 404)
  }

  // 3. Todos 取得
  const todosResult = await repositories.applicationRepository.findTodosByApplicationId(appId)
  if (!todosResult.success) {
    return c.json({ error: 'Failed to load todos' }, 500)
  }

  // 4. OrchestratorV2 でメッセージを処理
  const logger = new ConsoleLogger('[OrchestratorV2]')
  const orchestrator = new OrchestratorV2({
    kvStore: infrastructure.kvStore,
    registry: infrastructure.agentRegistry,
    provider: infrastructure.llmProvider,
    logger,
  })
  const result = await orchestrator.process(sessId.value, body.message)

  // 5. ユーザーメッセージを保存
  const now = new Date()
  const userMsg = ChatMessage.create({
    id: ChatMessageId.fromString(crypto.randomUUID()),
    chatSessionId: sessId,
    role: ChatMessageRole.user(),
    content: body.message,
    targetJobFormFieldId: null,
    targetReviewSignalId: null,
    reviewPassed: null,
    createdAt: now,
  })
  await repositories.applicationRepository.saveChatMessage(userMsg)

  // 6. アシスタントメッセージを保存（レスポンステキストがある場合のみ）
  let assistantMsg: ChatMessage | null = null
  if (result.responseText && result.responseText.trim().length > 0) {
    assistantMsg = ChatMessage.create({
      id: ChatMessageId.fromString(crypto.randomUUID()),
      chatSessionId: sessId,
      role: ChatMessageRole.assistant(),
      content: result.responseText,
      targetJobFormFieldId: null,
      targetReviewSignalId: null,
      reviewPassed: null,
      createdAt: now,
    })
    await repositories.applicationRepository.saveChatMessage(assistantMsg)
  }

  // 7. セッションを更新（ターンカウント増加 + エージェント変更）
  let updatedSession = session.incrementTurnCount()
  updatedSession = updatedSession.changeAgent(DomainAgentType.from(result.currentAgent))
  await repositories.applicationRepository.saveChatSession(updatedSession)

  // 8. フェーズを決定
  const phase = derivePhase(result.currentAgent, result.isComplete)

  return c.json(
    {
      data: {
        message: assistantMsg ? serializeChatMessage(assistantMsg) : undefined,
        session: serializeChatSession(updatedSession),
        todos: todosResult.value.map(serializeApplicationTodo),
        phase,
        isComplete: result.isComplete,
      },
    },
    200
  )
})

/**
 * エージェントタイプからフェーズを導出
 */
function derivePhase(
  currentAgent: string,
  isComplete: boolean
): 'bootstrap' | 'questioning' | 'fallback' | 'wrapup' {
  if (isComplete) {
    return 'wrapup'
  }
  switch (currentAgent) {
    case 'greeter':
    case 'architect':
      return 'bootstrap'
    case 'interviewer':
    case 'explorer':
    case 'quick_check':
    case 'reviewer':
    case 'auditor':
      return 'questioning'
    default:
      return 'questioning'
  }
}

export default app
