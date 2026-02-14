import { GetApplicationUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { applicationResponseSchema } from '../../../schemas/response'
import { serializeApplication } from '../../../schemas/serializers'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{applicationId}',
  operationId: 'getApplication',
  tags: ['Application'],
  summary: 'Get an application by ID',
  request: {
    params: z.object({
      applicationId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Application found',
      content: {
        'application/json': {
          schema: z.object({
            data: applicationResponseSchema,
          }),
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

  const usecase = new GetApplicationUsecase({
    applicationRepository: repositories.applicationRepository,
  })

  const result = await usecase.execute({ applicationId })

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  return c.json({ data: serializeApplication(result.value) }, 200)
})

export default app
