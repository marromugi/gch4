import { FormId, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'delete',
  path: '/{formId}',
  operationId: 'deleteForm',
  tags: ['Form'],
  summary: 'Delete a form',
  request: {
    params: z.object({
      formId: z.string(),
    }),
  },
  responses: {
    204: {
      description: 'Form deleted',
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
    404: {
      description: 'Form not found',
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
  const user = c.get('user')
  const { formId } = c.req.valid('param')

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const formResult = await repositories.formRepository.findById(FormId.fromString(formId))
  if (!formResult.success) {
    return c.json({ error: 'Form not found' }, 404)
  }

  if (!formResult.value.createdBy.equals(UserId.fromString(user.id))) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const deleteResult = await repositories.formRepository.delete(formResult.value.id)
  if (!deleteResult.success) {
    return c.json({ error: 'Failed to delete form' }, 500)
  }

  return c.body(null, 204)
})

export default app
