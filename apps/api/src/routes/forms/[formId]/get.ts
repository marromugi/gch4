import { FormId, FormStatus, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formResponseSchema } from '../../../schemas/response'
import { serializeForm } from '../../../schemas/serializers'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{formId}',
  operationId: 'getForm',
  tags: ['Form'],
  summary: 'Get a form by ID',
  request: {
    params: z.object({
      formId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Form found',
      content: {
        'application/json': {
          schema: z.object({
            data: formResponseSchema,
          }),
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

  const result = await repositories.formRepository.findById(FormId.fromString(formId))

  if (!result.success) {
    return c.json({ error: 'Form not found' }, 404)
  }

  const form = result.value
  const isOwner = user && form.createdBy.equals(UserId.fromString(user.id))
  const isPublished = form.status.equals(FormStatus.published())

  if (!isOwner && !isPublished) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  return c.json({ data: serializeForm(form) }, 200)
})

export default app
