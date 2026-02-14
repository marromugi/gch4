import { UpdateExtractedFieldUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { extractedFieldResponseSchema } from '../../../../../schemas/response'
import { serializeExtractedField } from '../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../types/hono'

const route = createRoute({
  method: 'put',
  path: '/{applicationId}/extracted-fields/{fieldId}',
  operationId: 'updateApplicationExtractedField',
  tags: ['Application'],
  summary: 'Update an extracted field value',
  request: {
    params: z.object({
      applicationId: z.string(),
      fieldId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            value: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Extracted field updated',
      content: {
        'application/json': {
          schema: z.object({
            data: extractedFieldResponseSchema,
          }),
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
  const { applicationId, fieldId } = c.req.valid('param')
  const body = c.req.valid('json')

  const usecase = new UpdateExtractedFieldUsecase({
    applicationRepository: repositories.applicationRepository,
  })

  const result = await usecase.execute({
    applicationId,
    extractedFieldId: fieldId,
    newValue: body.value,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'not_found') {
      return c.json({ error: error.message }, 404)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeExtractedField(result.value) }, 200)
})

export default app
