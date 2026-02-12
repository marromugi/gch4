import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { SaveConsentLogUsecase } from '@ding/domain'
import type { HonoEnv } from '../../types/hono'
import { consentLogResponseSchema } from '../../schemas/response'
import { serializeConsentLog } from '../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'saveConsentLog',
  tags: ['ConsentLog'],
  summary: 'Save a consent log',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            applicationId: z.string(),
            consentType: z.string(),
            consentLogId: z.string().optional(),
            consented: z.boolean(),
            ipAddress: z.string(),
            userAgent: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Consent log saved',
      content: {
        'application/json': {
          schema: z.object({
            data: consentLogResponseSchema,
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
  const body = c.req.valid('json')

  const usecase = new SaveConsentLogUsecase({
    applicationRepository: repositories.applicationRepository,
  })

  const result = await usecase.execute({
    applicationId: body.applicationId,
    consentType: body.consentType,
    consentLogId: body.consentLogId ?? crypto.randomUUID(),
    consented: body.consented,
    ipAddress: body.ipAddress,
    userAgent: body.userAgent,
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

  return c.json({ data: serializeConsentLog(result.value) }, 201)
})

export default app
