import { SaveJobFormFields } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { jobFormFieldResponseSchema } from '../../../../schemas/response'
import { serializeJobFormField } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'put',
  path: '/{jobId}/form-fields',
  operationId: 'saveJobFormFields',
  tags: ['Job'],
  summary: 'Save form fields for a job',
  request: {
    params: z.object({
      jobId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            fields: z
              .array(
                z.object({
                  id: z.string(),
                  fieldId: z.string(),
                  label: z.string(),
                  intent: z.string().nullable(),
                  required: z.boolean(),
                  sortOrder: z.number(),
                })
              )
              .optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Form fields saved',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(jobFormFieldResponseSchema),
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
  const body = c.req.valid('json')

  const usecase = new SaveJobFormFields(repositories.jobRepository)
  const result = await usecase.execute({
    jobId,
    fields: body.fields ?? [],
  })

  if (!result.success) {
    return c.json({ error: result.error.message }, 400)
  }

  return c.json({ data: result.value.fields.map(serializeJobFormField) }, 200)
})

export default app
