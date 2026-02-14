import { SaveExtractedFieldUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { extractedFieldResponseSchema } from '../../../../schemas/response'
import { serializeExtractedField } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{applicationId}/extracted-fields',
  operationId: 'saveApplicationExtractedField',
  tags: ['Application'],
  summary: 'Save an extracted field for an application',
  request: {
    params: z.object({
      applicationId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            extractedFieldId: z.string().optional(),
            jobFormFieldId: z.string(),
            value: z.string(),
            source: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Extracted field saved',
      content: {
        'application/json': {
          schema: z.object({
            data: extractedFieldResponseSchema,
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
  const { applicationId } = c.req.valid('param')
  const body = c.req.valid('json')

  const usecase = new SaveExtractedFieldUsecase({
    applicationRepository: repositories.applicationRepository,
  })

  const result = await usecase.execute({
    applicationId,
    extractedFieldId: body.extractedFieldId ?? crypto.randomUUID(),
    jobFormFieldId: body.jobFormFieldId,
    value: body.value,
    source: body.source,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    if (error.type === 'not_found') {
      return c.json({ error: error.message }, 404)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeExtractedField(result.value) }, 201)
})

export default app
