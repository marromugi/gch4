import { UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formResponseSchema } from '../../../../schemas/response'
import { serializeForm } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{userId}/forms',
  operationId: 'listFormsByUser',
  tags: ['User'],
  summary: 'List forms by user',
  request: {
    params: z.object({
      userId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of forms for the user',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(formResponseSchema),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    403: {
      description: 'Forbidden',
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
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { repositories } = c.get('di')
  const { userId } = c.req.valid('param')

  if (user.id !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const result = await repositories.formRepository.findByUserId(UserId.fromString(userId))

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  return c.json({ data: result.value.map(serializeForm) }, 200)
})

export default app
