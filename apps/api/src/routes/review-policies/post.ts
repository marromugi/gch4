import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { CreateReviewPolicyUsecase } from '@ding/domain'
import type { HonoEnv } from '../../types/hono'
import {
  reviewPolicyVersionResponseSchema,
  reviewPolicySignalResponseSchema,
  reviewProhibitedTopicResponseSchema,
} from '../../schemas/response'
import {
  serializeReviewPolicyVersion,
  serializeReviewPolicySignal,
  serializeReviewProhibitedTopic,
} from '../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createReviewPolicy',
  tags: ['ReviewPolicy'],
  summary: 'Create a review policy',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().optional(),
            jobId: z.string(),
            softCap: z.number(),
            hardCap: z.number(),
            signals: z
              .array(
                z.object({
                  label: z.string(),
                  description: z.string().nullable(),
                  priority: z.string(),
                  category: z.string(),
                })
              )
              .optional(),
            prohibitedTopics: z
              .array(
                z.object({
                  topic: z.string(),
                })
              )
              .optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Review policy created',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              policy: reviewPolicyVersionResponseSchema,
              signals: z.array(reviewPolicySignalResponseSchema),
              prohibitedTopics: z.array(reviewProhibitedTopicResponseSchema),
            }),
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
    401: {
      description: 'Unauthorized',
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
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { repositories } = c.get('di')
  const body = c.req.valid('json')

  const usecase = new CreateReviewPolicyUsecase({
    reviewPolicyRepository: repositories.reviewPolicyRepository,
  })

  const result = await usecase.execute({
    id: body.id ?? crypto.randomUUID(),
    jobId: body.jobId,
    createdBy: user.id,
    softCap: body.softCap,
    hardCap: body.hardCap,
    signals: body.signals ?? [],
    prohibitedTopics: body.prohibitedTopics ?? [],
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  const { policy, signals, prohibitedTopics } = result.value
  return c.json(
    {
      data: {
        policy: serializeReviewPolicyVersion(policy),
        signals: signals.map(serializeReviewPolicySignal),
        prohibitedTopics: prohibitedTopics.map(serializeReviewProhibitedTopic),
      },
    },
    201
  )
})

export default app
