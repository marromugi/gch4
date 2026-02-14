import { TriggerManualFallbackUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { applicationResponseSchema } from '../../../../schemas/response'
import { serializeApplication } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{applicationId}/manual-fallback',
  operationId: 'triggerManualFallback',
  tags: ['Application'],
  summary: 'Trigger manual fallback for an application',
  request: {
    params: z.object({
      applicationId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Manual fallback triggered',
      content: {
        'application/json': {
          schema: z.object({
            data: applicationResponseSchema,
          }),
        },
      },
    },
    404: {
      description: 'Not found',
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

  const usecase = new TriggerManualFallbackUsecase({
    applicationRepository: repositories.applicationRepository,
    eventLogRepository: repositories.eventLogRepository,
    fallbackService: services.fallbackService,
  })

  const result = await usecase.execute({
    applicationId,
    eventLogId: crypto.randomUUID(),
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'not_found') {
      return c.json({ error: error.message }, 404)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeApplication(result.value) }, 200)
})

export default app
