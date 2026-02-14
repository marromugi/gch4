import { RecordEventLogUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eventLogResponseSchema } from '../../schemas/response'
import { serializeEventLog } from '../../schemas/serializers'
import type { HonoEnv } from '../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'recordEventLog',
  tags: ['EventLog'],
  summary: 'Record an event log',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            eventLogId: z.string().optional(),
            eventType: z.string(),
            submissionId: z.string().nullable(),
            formId: z.string().nullable(),
            chatSessionId: z.string().nullable(),
            metadata: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Event log recorded',
      content: {
        'application/json': {
          schema: z.object({
            data: eventLogResponseSchema,
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

  const usecase = new RecordEventLogUsecase({
    eventLogRepository: repositories.eventLogRepository,
  })

  const result = await usecase.execute({
    eventLogId: body.eventLogId ?? crypto.randomUUID(),
    eventType: body.eventType,
    submissionId: body.submissionId ?? undefined,
    formId: body.formId ?? undefined,
    chatSessionId: body.chatSessionId ?? undefined,
    metadata: body.metadata,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeEventLog(result.value) }, 201)
})

export default app
