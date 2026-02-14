import { OrchestratorV2, ConsoleLogger } from '@ding/agent'
import { ChatMessage } from '@ding/domain/domain/entity'
import {
  SubmissionId,
  ChatSessionId,
  ChatMessageId,
  ChatMessageRole,
  AgentType as DomainAgentType,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  chatSessionResponseSchema,
  chatMessageResponseSchema,
  submissionTaskResponseSchema,
} from '../../../../../../../schemas/response'
import {
  serializeChatSession,
  serializeChatMessage,
  serializeSubmissionTask,
} from '../../../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{submissionId}/chat/sessions/{sessionId}/messages',
  operationId: 'sendChatMessage',
  tags: ['Chat'],
  summary: 'Send a message to a chat session',
  request: {
    params: z.object({
      submissionId: z.string(),
      sessionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            content: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message sent and response received',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              message: chatMessageResponseSchema,
              session: chatSessionResponseSchema,
              todos: z.array(submissionTaskResponseSchema),
              phase: z.string(),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Session not found',
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
  const { submissionId, sessionId } = c.req.valid('param')
  const body = c.req.valid('json')

  const submissionIdVO = SubmissionId.fromString(submissionId)
  const sessionIdVO = ChatSessionId.fromString(sessionId)

  // Get session
  const sessionResult = await repositories.submissionRepository.findChatSessionById(sessionIdVO)
  if (!sessionResult.success) {
    return c.json({ error: 'Session not found' }, 404)
  }
  let session = sessionResult.value

  const now = new Date()

  // Save user message
  const userMessage = ChatMessage.create({
    id: ChatMessageId.fromString(crypto.randomUUID()),
    chatSessionId: sessionIdVO,
    role: ChatMessageRole.user(),
    content: body.content,
    targetFormFieldId: null,
    reviewPassed: null,
    createdAt: now,
  })
  await repositories.submissionRepository.saveChatMessage(userMessage)

  // Process with orchestrator
  const logger = new ConsoleLogger('[OrchestratorV2]')
  const orchestrator = new OrchestratorV2({
    kvStore: infrastructure.kvStore,
    registry: infrastructure.agentRegistry,
    provider: infrastructure.llmProvider,
    logger,
  })

  const result = await orchestrator.process(sessionIdVO.value, body.content)

  // Save assistant message
  const assistantMessage = ChatMessage.create({
    id: ChatMessageId.fromString(crypto.randomUUID()),
    chatSessionId: sessionIdVO,
    role: ChatMessageRole.assistant(),
    content: result.responseText,
    targetFormFieldId: null,
    reviewPassed: null,
    createdAt: new Date(),
  })
  await repositories.submissionRepository.saveChatMessage(assistantMessage)

  // Update session
  session = session.incrementTurnCount()
  session = session.changeAgent(DomainAgentType.from(result.currentAgent))
  await repositories.submissionRepository.saveChatSession(session)

  // Get updated todos
  const todosResult =
    await repositories.submissionRepository.findTasksBySubmissionId(submissionIdVO)
  if (!todosResult.success) {
    return c.json({ error: 'Failed to load todos' }, 500)
  }

  return c.json(
    {
      data: {
        message: serializeChatMessage(assistantMessage),
        session: serializeChatSession(session),
        todos: todosResult.value.map(serializeSubmissionTask),
        phase: result.currentAgent,
      },
    },
    200
  )
})

export default app
