import { SubmissionId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { submissionResponseSchema } from '../../../schemas/response'
import { serializeSubmission } from '../../../schemas/serializers'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{submissionId}',
  operationId: 'getSubmission',
  tags: ['Submission'],
  summary: 'Get a submission by ID',
  request: {
    params: z.object({
      submissionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Submission found',
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
  const { repositories } = c.get('di')
  const { submissionId } = c.req.valid('param')

  const result = await repositories.submissionRepository.findById(
    SubmissionId.fromString(submissionId)
  )

  if (!result.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }

  return c.json({ data: serializeSubmission(result.value) }, 200)
})

export default app
