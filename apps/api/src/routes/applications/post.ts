import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { CreateApplicationUsecase } from '@ding/domain'
import type { HonoEnv } from '../../types/hono'
import { applicationResponseSchema } from '../../schemas/response'
import { serializeApplication } from '../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createApplication',
  tags: ['Application'],
  summary: 'Create a new application',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            applicationId: z.string().optional(),
            jobId: z.string(),
            schemaVersionId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Application created',
      content: {
        'application/json': {
          schema: z.object({
            data: applicationResponseSchema,
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
  const body = c.req.valid('json')

  const usecase = new CreateApplicationUsecase({
    applicationRepository: repositories.applicationRepository,
    jobRepository: repositories.jobRepository,
  })

  const result = await usecase.execute({
    applicationId: body.applicationId ?? crypto.randomUUID(),
    jobId: body.jobId,
    schemaVersionId: body.schemaVersionId,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'not_found') {
      return c.json({ error: error.message }, 404)
    }
    if (error.type === 'no_schema_version') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeApplication(result.value) }, 201)
})

export default app
