import { SubmissionId, SubmissionStatus } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { submissionResponseSchema } from '../../../../schemas/response'
import { serializeSubmission } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'patch',
  path: '/{submissionId}/status',
  operationId: 'updateSubmissionStatus',
  tags: ['Submission'],
  summary: 'Update submission status',
  request: {
    params: z.object({
      submissionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['new', 'in_progress', 'review_completed', 'submitted']),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Status updated',
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
  const body = c.req.valid('json')

  const submissionResult = await repositories.submissionRepository.findById(
    SubmissionId.fromString(submissionId)
  )
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }

  try {
    const newStatus = SubmissionStatus.from(body.status)
    const updated = submissionResult.value.transitionTo(newStatus)

    const saveResult = await repositories.submissionRepository.save(updated)
    if (!saveResult.success) {
      return c.json({ error: 'Failed to save submission' }, 500)
    }

    return c.json({ data: serializeSubmission(updated) }, 200)
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Validation error' }, 400)
  }
})

export default app
