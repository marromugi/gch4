import { SubmissionId, ChatSessionId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  chatSessionResponseSchema,
  chatMessageResponseSchema,
  submissionTaskResponseSchema,
} from '../../../../../../schemas/response'
import {
  serializeChatSession,
  serializeChatMessage,
  serializeSubmissionTask,
} from '../../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{submissionId}/chat/sessions/{sessionId}',
  operationId: 'getChatSession',
  tags: ['Chat'],
  summary: 'Get a chat session with messages and todos',
  request: {
    params: z.object({
      submissionId: z.string(),
      sessionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Chat session found',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              session: chatSessionResponseSchema,
              messages: z.array(chatMessageResponseSchema),
              todos: z.array(submissionTaskResponseSchema),
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
  const { repositories } = c.get('di')
  const { submissionId, sessionId } = c.req.valid('param')

  const submissionIdVO = SubmissionId.fromString(submissionId)
  const sessionIdVO = ChatSessionId.fromString(sessionId)

  // Get session
  const sessionResult = await repositories.submissionRepository.findChatSessionById(sessionIdVO)
  if (!sessionResult.success) {
    return c.json({ error: 'Session not found' }, 404)
  }
  const session = sessionResult.value

  // Get messages
  const messagesResult =
    await repositories.submissionRepository.findChatMessagesBySessionId(sessionIdVO)
  if (!messagesResult.success) {
    return c.json({ error: 'Failed to load messages' }, 500)
  }

  // Get todos
  const todosResult =
    await repositories.submissionRepository.findTasksBySubmissionId(submissionIdVO)
  if (!todosResult.success) {
    return c.json({ error: 'Failed to load todos' }, 500)
  }

  return c.json(
    {
      data: {
        session: serializeChatSession(session),
        messages: messagesResult.value.map(serializeChatMessage),
        todos: todosResult.value.map(serializeSubmissionTask),
      },
    },
    200
  )
})

export default app
