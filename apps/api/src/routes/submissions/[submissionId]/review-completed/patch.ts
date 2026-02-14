import { EventLog } from '@ding/domain/domain/entity'
import { SubmissionId, EventLogId, EventType } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { submissionResponseSchema } from '../../../../schemas/response'
import { serializeSubmission } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'patch',
  path: '/{submissionId}/review-completed',
  operationId: 'markReviewCompleted',
  tags: ['Submission'],
  summary: 'Mark review as completed',
  request: {
    params: z.object({
      submissionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Review marked as completed',
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

  const submissionIdVO = SubmissionId.fromString(submissionId)

  const submissionResult = await repositories.submissionRepository.findById(submissionIdVO)
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }

  try {
    const updated = submissionResult.value.markReviewCompleted()

    const saveResult = await repositories.submissionRepository.save(updated)
    if (!saveResult.success) {
      return c.json({ error: 'Failed to save submission' }, 500)
    }

    // Record event log
    const now = new Date()
    const eventLog = EventLog.create({
      id: EventLogId.fromString(crypto.randomUUID()),
      formId: updated.formId,
      submissionId: updated.id,
      chatSessionId: null,
      eventType: EventType.reviewCompleted(),
      metadata: null,
      createdAt: now,
    })
    await repositories.eventLogRepository.create(eventLog)

    return c.json({ data: serializeSubmission(updated) }, 200)
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Validation error' }, 400)
  }
})

export default app
