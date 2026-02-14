import { SaveInterviewFeedbackUsecase } from '@ding/domain'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { interviewFeedbackResponseSchema } from '../../schemas/response'
import { serializeInterviewFeedback } from '../../schemas/serializers'
import type { HonoEnv } from '../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'saveInterviewFeedback',
  tags: ['InterviewFeedback'],
  summary: 'Save an interview feedback',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().optional(),
            applicationId: z.string(),
            chatSessionId: z.string(),
            policyVersionId: z.string(),
            structuredData: z.string().nullable().optional(),
            structuredSchemaVersion: z.number(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Interview feedback saved',
      content: {
        'application/json': {
          schema: z.object({
            data: interviewFeedbackResponseSchema,
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

  const usecase = new SaveInterviewFeedbackUsecase({
    interviewFeedbackRepository: repositories.interviewFeedbackRepository,
  })

  const result = await usecase.execute({
    id: body.id ?? crypto.randomUUID(),
    applicationId: body.applicationId,
    chatSessionId: body.chatSessionId,
    policyVersionId: body.policyVersionId,
    structuredData: body.structuredData ?? null,
    structuredSchemaVersion: body.structuredSchemaVersion,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeInterviewFeedback(result.value) }, 201)
})

export default app
