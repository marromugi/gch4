import { PublishFormUsecase } from '@ding/domain/presentation/usecase'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formResponseSchema } from '../../../../schemas/response'
import { serializeForm } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{formId}/publish',
  operationId: 'publishForm',
  tags: ['Form'],
  summary: 'Publish a form',
  request: {
    params: z.object({
      formId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Form published',
      content: {
        'application/json': {
          schema: z.object({
            data: formResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
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

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const usecase = new PublishFormUsecase({
    formRepository: repositories.formRepository,
  })

  const result = await usecase.execute({
    formId,
    userId: user.id,
  })

  if (!result.success) {
    const error = result.error
    switch (error.type) {
      case 'not_found_error':
        return c.json({ error: 'Form not found' }, 404)
      case 'forbidden_error':
        return c.json({ error: 'Forbidden' }, 403)
      case 'business_error':
        return c.json({ error: error.message }, 400)
      case 'repository_error':
        return c.json({ error: 'Failed to save form' }, 500)
    }
  }

  return c.json({ data: serializeForm(result.value) }, 200)
})

export default app
