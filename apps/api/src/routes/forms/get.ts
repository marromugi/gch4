import { UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formResponseSchema } from '../../schemas/response'
import { serializeForm } from '../../schemas/serializers'
import type { HonoEnv } from '../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/',
  operationId: 'listForms',
  tags: ['Form'],
  summary: 'List all forms',
  responses: {
    200: {
      description: 'List of forms',
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

  const result = await repositories.formRepository.findByUserId(UserId.fromString(user.id))

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  return c.json({ data: result.value.map(serializeForm) }, 200)
})

export default app
