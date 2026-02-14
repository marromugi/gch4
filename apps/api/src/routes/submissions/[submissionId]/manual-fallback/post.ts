import { EventLog } from '@ding/domain/domain/entity'
import { SubmissionId, EventLogId, EventType } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { submissionResponseSchema } from '../../../../schemas/response'
import { serializeSubmission } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{submissionId}/manual-fallback',
  operationId: 'triggerManualFallback',
  tags: ['Submission'],
  summary: 'Trigger manual fallback for a submission',
  request: {
    params: z.object({
      submissionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Manual fallback triggered',
      content: {
        'application/json': {
          schema: z.object({
            data: submissionResponseSchema,
          }),
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
  const { repositories, services } = c.get('di')
  const { submissionId } = c.req.valid('param')

  const submissionIdVO = SubmissionId.fromString(submissionId)

  const submissionResult = await repositories.submissionRepository.findById(submissionIdVO)
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }

  const submission = submissionResult.value

  // Get tasks and trigger manual fallback
  const tasksResult =
    await repositories.submissionRepository.findTasksBySubmissionId(submissionIdVO)
  if (!tasksResult.success) {
    return c.json({ error: 'Failed to load tasks' }, 500)
  }

  const updatedTasks = services.fallbackService.triggerFallback(tasksResult.value)

  // Save updated tasks
  for (const task of updatedTasks) {
    await repositories.submissionRepository.saveTask(task)
  }

  // Record event log
  const now = new Date()
  const eventLog = EventLog.create({
    id: EventLogId.fromString(crypto.randomUUID()),
    formId: submission.formId,
    submissionId: submission.id,
    chatSessionId: null,
    eventType: EventType.manualFallbackTriggered(),
    metadata: null,
    createdAt: now,
  })
  await repositories.eventLogRepository.create(eventLog)

  return c.json({ data: serializeSubmission(submission) }, 200)
})

export default app
