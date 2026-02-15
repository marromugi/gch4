import { GetFormUsecase } from '@ding/domain/presentation/usecase'
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

  const usecase = new GetFormUsecase({
    formRepository: repositories.formRepository,
  })

  const result = await usecase.execute({
    formId,
    userId: user?.id ?? null,
  })

  if (!result.success) {
    const error = result.error
    switch (error.type) {
      case 'not_found_error':
        return c.json({ error: 'Form not found' }, 404)
      case 'forbidden_error':
        return c.json({ error: 'Forbidden' }, 403)
      case 'repository_error':
        return c.json({ error: 'Internal server error' }, 500)
    }
  }

  return c.json({ data: serializeForm(result.value) }, 200)
})

export default app
