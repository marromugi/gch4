import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { UpdateApplicationStatusUsecase } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import { applicationResponseSchema } from '../../../../schemas/response'
import { serializeApplication } from '../../../../schemas/serializers'

const route = createRoute({
  method: 'patch',
  path: '/{applicationId}/status',
  operationId: 'updateApplicationStatus',
  tags: ['Application'],
  summary: 'Update application status',
  request: {
    params: z.object({
      applicationId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Status updated',
      content: {
        'application/json': {
          schema: z.object({
            data: applicationResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
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
  const { applicationId } = c.req.valid('param')
  const body = c.req.valid('json')

  const usecase = new UpdateApplicationStatusUsecase({
    applicationRepository: repositories.applicationRepository,
  })

  const result = await usecase.execute({
    applicationId,
    newStatus: body.status,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'transition_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeApplication(result.value) }, 200)
})

export default app
