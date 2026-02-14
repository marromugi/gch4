import { EventLog } from '@ding/domain/domain/entity'
import { SubmissionId, EventLogId, EventType } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { submissionResponseSchema } from '../../../../schemas/response'
import { serializeSubmission } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{submissionId}/submit',
  operationId: 'submitSubmission',
  tags: ['Submission'],
  summary: 'Submit a submission',
  request: {
    params: z.object({
      submissionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Submission submitted',
      content: {
        'application/json': {
          schema: z.object({
            data: submissionResponseSchema,
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
      description: 'Submission not found',
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
  const { submissionId } = c.req.valid('param')

  const submissionResult = await repositories.submissionRepository.findById(
    SubmissionId.fromString(submissionId)
  )
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }

  try {
    const submitted = submissionResult.value.submit()

    const saveResult = await repositories.submissionRepository.save(submitted)
    if (!saveResult.success) {
      return c.json({ error: 'Failed to save submission' }, 500)
    }

    // Record event log
    const now = new Date()
    const eventLog = EventLog.create({
      id: EventLogId.fromString(crypto.randomUUID()),
      formId: submitted.formId,
      submissionId: submitted.id,
      chatSessionId: null,
      eventType: EventType.submissionSubmitted(),
      metadata: null,
      createdAt: now,
    })
    await repositories.eventLogRepository.create(eventLog)

    return c.json({ data: serializeSubmission(submitted) }, 200)
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Validation error' }, 400)
  }
})

export default app
