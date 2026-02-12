import { GetJobUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../types/hono'
import { jobResponseSchema } from '../../../schemas/response'
import { serializeJob } from '../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{jobId}',
  operationId: 'getJob',
  tags: ['Job'],
  summary: 'Get a job by ID',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Job details',
      content: {
        'application/json': {
          schema: z.object({
            data: jobResponseSchema,
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
  const { repositories } = c.get('di')
  const { jobId } = c.req.valid('param')

  const usecase = new GetJobUsecase({
    jobRepository: repositories.jobRepository,
  })

  const result = await usecase.execute({ jobId })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeJob(result.value) }, 200)
})

export default app
