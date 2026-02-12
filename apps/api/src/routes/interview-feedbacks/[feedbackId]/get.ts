import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { GetInterviewFeedbackUsecase } from '@ding/domain'
import type { HonoEnv } from '../../../types/hono'
import { interviewFeedbackResponseSchema } from '../../../schemas/response'
import { serializeInterviewFeedback } from '../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{feedbackId}',
  operationId: 'getInterviewFeedback',
  tags: ['InterviewFeedback'],
  summary: 'Get an interview feedback',
  request: {
    params: z.object({
      feedbackId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Interview feedback',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(interviewFeedbackResponseSchema).nullable(),
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
  const { feedbackId } = c.req.valid('param')

  const usecase = new GetInterviewFeedbackUsecase({
    interviewFeedbackRepository: repositories.interviewFeedbackRepository,
  })

  const result = await usecase.execute({ applicationId: feedbackId })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  if (result.value === null) {
    return c.json({ data: null }, 200)
  }

  return c.json({ data: result.value.map(serializeInterviewFeedback) }, 200)
})

export default app
