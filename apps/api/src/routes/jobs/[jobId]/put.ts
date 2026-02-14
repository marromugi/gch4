import { UpdateJobUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { jobResponseSchema } from '../../../schemas/response'
import { serializeJob } from '../../../schemas/serializers'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'put',
  path: '/{jobId}',
  operationId: 'updateJob',
  tags: ['Job'],
  summary: 'Update a job',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string().optional(),
            idealCandidate: z.string().nullable().optional(),
            cultureContext: z.string().nullable().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Job updated',
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
  const { repositories } = c.get('di')
  const { jobId } = c.req.valid('param')
  const body = c.req.valid('json')

  const usecase = new UpdateJobUsecase({
    jobRepository: repositories.jobRepository,
  })

  const result = await usecase.execute({
    jobId,
    title: body.title,
    idealCandidate: body.idealCandidate,
    cultureContext: body.cultureContext,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    if (error.type === 'not_found_error') {
      return c.json({ error: error.message }, 404)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeJob(result.value) }, 200)
})

export default app
