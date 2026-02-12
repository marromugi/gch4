import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ListJobsUsecase } from '@ding/domain'
import type { HonoEnv } from '../../types/hono'
import { jobResponseSchema } from '../../schemas/response'
import { serializeJob } from '../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/',
  operationId: 'listJobs',
  tags: ['Job'],
  summary: 'List jobs for the authenticated user',
  responses: {
    200: {
      description: 'List of jobs',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(jobResponseSchema),
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
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { repositories } = c.get('di')

  const usecase = new ListJobsUsecase({
    jobRepository: repositories.jobRepository,
  })

  const result = await usecase.execute({ userId: user.id })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: result.value.map(serializeJob) }, 200)
})

export default app
