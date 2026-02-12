import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { CreateJobUsecase } from '@ding/domain'
import type { HonoEnv } from '../../types/hono'
import { jobResponseSchema } from '../../schemas/response'
import { serializeJob } from '../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createJob',
  tags: ['Job'],
  summary: 'Create a new job',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string(),
            idealCandidate: z.string().nullable().optional(),
            cultureContext: z.string().nullable().optional(),
            formFields: z
              .array(
                z.object({
                  label: z.string(),
                  intent: z.string(),
                  required: z.boolean(),
                })
              )
              .optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Job created',
      content: {
        'application/json': {
          schema: z.object({
            data: jobResponseSchema,
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
  const body = c.req.valid('json')

  const usecase = new CreateJobUsecase({
    jobRepository: repositories.jobRepository,
    generateId: () => crypto.randomUUID(),
  })

  const result = await usecase.execute({
    title: body.title,
    idealCandidate: body.idealCandidate ?? null,
    cultureContext: body.cultureContext ?? null,
    userId: user.id,
    formFields: body.formFields ?? [],
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeJob(result.value) }, 201)
})

export default app
