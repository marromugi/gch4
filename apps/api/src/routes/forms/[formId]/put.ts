import { FormId, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formResponseSchema } from '../../../schemas/response'
import { serializeForm } from '../../../schemas/serializers'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'put',
  path: '/{formId}',
  operationId: 'updateForm',
  tags: ['Form'],
  summary: 'Update a form',
  request: {
    params: z.object({
      formId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string().optional(),
            description: z.string().nullable().optional(),
            purpose: z.string().nullable().optional(),
            completionMessage: z.string().nullable().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Form updated',
      content: {
        'application/json': {
          schema: z.object({
            data: formResponseSchema,
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
  const body = c.req.valid('json')

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

  let form = formResult.value

  if (body.title !== undefined) {
    form = form.updateTitle(body.title)
  }
  if (body.description !== undefined) {
    form = form.updateDescription(body.description)
  }
  if (body.purpose !== undefined) {
    form = form.updatePurpose(body.purpose)
  }
  if (body.completionMessage !== undefined) {
    form = form.updateCompletionMessage(body.completionMessage)
  }

  const saveResult = await repositories.formRepository.save(form)
  if (!saveResult.success) {
    return c.json({ error: 'Failed to save form' }, 500)
  }

  return c.json({ data: serializeForm(form) }, 200)
})

export default app
