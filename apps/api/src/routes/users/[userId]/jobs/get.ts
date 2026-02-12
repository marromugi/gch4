import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ListJobsByUser } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import { jobResponseSchema } from '../../../../schemas/response'
import { serializeJob } from '../../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{userId}/jobs',
  operationId: 'listJobsByUser',
  tags: ['User'],
  summary: 'List jobs by user',
  request: {
    params: z.object({
      userId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of jobs for the user',
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

  const usecase = new ListJobsByUser(repositories.jobRepository)
  const result = await usecase.execute({ userId: user.id })

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  return c.json({ data: result.value.jobs.map(serializeJob) }, 200)
})

export default app
