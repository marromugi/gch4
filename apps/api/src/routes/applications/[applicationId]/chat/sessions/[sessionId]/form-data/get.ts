import { KVKeys } from '@ding/agent'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../../../../../types/hono'

const formDataResponseSchema = z.object({
  sessionId: z.string(),
  collectedFields: z.record(z.string(), z.string()),
  completedAt: z.number(),
})

const route = createRoute({
  method: 'get',
  path: '/{applicationId}/chat/sessions/{sessionId}/form-data',
  operationId: 'getChatSessionFormData',
  tags: ['Chat'],
  summary: 'Get collected form data from a completed chat session',
  request: {
    params: z.object({
      applicationId: z.string(),
      sessionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Form data retrieved',
      content: {
        'application/json': {
          schema: z.object({
            data: formDataResponseSchema,
          }),
        },
      },
    },
    404: {
      description: 'Form data not found (session not completed or expired)',
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
  const { infrastructure } = c.get('di')
  const { sessionId } = c.req.valid('param')

  // KV から formData を取得
  const formData = await infrastructure.kvStore.get<{
    sessionId: string
    collectedFields: Record<string, string>
    completedAt: number
  }>(KVKeys.formData(sessionId))

  if (!formData) {
    return c.json(
      { error: 'Form data not found. Session may not be completed or data may have expired.' },
      404
    )
  }

  return c.json({ data: formData }, 200)
})

export default app
