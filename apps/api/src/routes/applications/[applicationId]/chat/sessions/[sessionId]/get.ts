import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ApplicationId } from '@ding/domain/domain/valueObject'
import { ChatSessionId } from '@ding/domain/domain/valueObject'
import type { HonoEnv } from '../../../../../../types/hono'
import {
  chatSessionResponseSchema,
  chatMessageResponseSchema,
  applicationTodoResponseSchema,
} from '../../../../../../schemas/response'
import {
  serializeChatSession,
  serializeChatMessage,
  serializeApplicationTodo,
} from '../../../../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{applicationId}/chat/sessions/{sessionId}',
  operationId: 'getChatSession',
  tags: ['Chat'],
  summary: 'Get a chat session with messages and todos',
  request: {
    params: z.object({
      applicationId: z.string(),
      sessionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Chat session retrieved',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              session: chatSessionResponseSchema,
              messages: z.array(chatMessageResponseSchema),
              todos: z.array(applicationTodoResponseSchema),
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
  const { applicationId, sessionId } = c.req.valid('param')

  const appId = ApplicationId.fromString(applicationId)
  const sessId = ChatSessionId.fromString(sessionId)

  // 1. セッション一覧から sessionId で絞り込み
  const sessionsResult =
    await repositories.applicationRepository.findChatSessionsByApplicationId(appId)
  if (!sessionsResult.success) {
    return c.json({ error: 'Failed to load sessions' }, 500)
  }
  const session = sessionsResult.value.find((s) => s.id.equals(sessId))
  if (!session) {
    return c.json({ error: 'Chat session not found' }, 404)
  }

  // 2. メッセージ一覧
  const messagesResult =
    await repositories.applicationRepository.findChatMessagesBySessionId(sessId)
  if (!messagesResult.success) {
    return c.json({ error: 'Failed to load messages' }, 500)
  }

  // 3. Todo 一覧
  const todosResult = await repositories.applicationRepository.findTodosByApplicationId(appId)
  if (!todosResult.success) {
    return c.json({ error: 'Failed to load todos' }, 500)
  }

  return c.json(
    {
      data: {
        session: serializeChatSession(session),
        messages: messagesResult.value.map(serializeChatMessage),
        todos: todosResult.value.map(serializeApplicationTodo),
      },
    },
    200
  )
})

export default app
