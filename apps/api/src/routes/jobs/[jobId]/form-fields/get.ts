import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { GetJobFormFields } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import { jobFormFieldResponseSchema } from '../../../../schemas/response'
import { serializeJobFormField } from '../../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{jobId}/form-fields',
  operationId: 'getJobFormFields',
  tags: ['Job'],
  summary: 'Get form fields for a job',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Form fields',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(jobFormFieldResponseSchema),
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

  const usecase = new GetJobFormFields(repositories.jobRepository)
  const result = await usecase.execute({ jobId })

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  return c.json({ data: result.value.fields.map(serializeJobFormField) }, 200)
})

export default app
