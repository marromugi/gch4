import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ListApplicationsUsecase } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import { applicationResponseSchema } from '../../../../schemas/response'
import { serializeApplication } from '../../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{jobId}/applications',
  operationId: 'listJobApplications',
  tags: ['Job'],
  summary: 'List applications for a job',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of applications',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(applicationResponseSchema),
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
  const { jobId } = c.req.valid('param')

  const usecase = new ListApplicationsUsecase({
    applicationRepository: repositories.applicationRepository,
  })

  const result = await usecase.execute({ jobId })

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  return c.json({ data: result.value.map(serializeApplication) }, 200)
})

export default app
