import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { CloseJob } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import { jobResponseSchema } from '../../../../schemas/response'
import { serializeJob } from '../../../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/{jobId}/close',
  operationId: 'closeJob',
  tags: ['Job'],
  summary: 'Close a job',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Job closed',
      content: {
        'application/json': {
          schema: z.object({
            data: jobResponseSchema,
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
  },
})

const app = new OpenAPIHono<HonoEnv>()

app.openapi(route, async (c) => {
  const { repositories } = c.get('di')
  const { jobId } = c.req.valid('param')

  const usecase = new CloseJob(repositories.jobRepository)
  const result = await usecase.execute({ jobId })

  if (!result.success) {
    return c.json({ error: result.error.message }, 400)
  }

  return c.json({ data: serializeJob(result.value.job) }, 200)
})

export default app
