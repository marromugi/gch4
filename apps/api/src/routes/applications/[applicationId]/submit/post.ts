import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { SubmitApplicationUsecase } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import { applicationResponseSchema } from '../../../../schemas/response'
import { serializeApplication } from '../../../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/{applicationId}/submit',
  operationId: 'submitApplication',
  tags: ['Application'],
  summary: 'Submit an application',
  request: {
    params: z.object({
      applicationId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Application submitted',
      content: {
        'application/json': {
          schema: z.object({
            data: applicationResponseSchema,
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
  const { repositories, services } = c.get('di')
  const { applicationId } = c.req.valid('param')

  const usecase = new SubmitApplicationUsecase({
    applicationRepository: repositories.applicationRepository,
    submissionService: services.submissionService,
  })

  const result = await usecase.execute({ applicationId })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeApplication(result.value) }, 200)
})

export default app
