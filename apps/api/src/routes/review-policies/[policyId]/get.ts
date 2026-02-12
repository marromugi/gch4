import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { GetReviewPolicyUsecase } from '@ding/domain'
import type { HonoEnv } from '../../../types/hono'
import {
  reviewPolicyVersionResponseSchema,
  reviewPolicySignalResponseSchema,
  reviewProhibitedTopicResponseSchema,
} from '../../../schemas/response'
import {
  serializeReviewPolicyVersion,
  serializeReviewPolicySignal,
  serializeReviewProhibitedTopic,
} from '../../../schemas/serializers'

const route = createRoute({
  method: 'get',
  path: '/{policyId}',
  operationId: 'getReviewPolicy',
  tags: ['ReviewPolicy'],
  summary: 'Get a review policy',
  request: {
    params: z.object({
      policyId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Review policy',
      content: {
        'application/json': {
          schema: z.object({
            data: z
              .object({
                policy: reviewPolicyVersionResponseSchema,
                signals: z.array(reviewPolicySignalResponseSchema),
                prohibitedTopics: z.array(reviewProhibitedTopicResponseSchema),
              })
              .nullable(),
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
  const { policyId } = c.req.valid('param')

  const usecase = new GetReviewPolicyUsecase({
    reviewPolicyRepository: repositories.reviewPolicyRepository,
  })

  const result = await usecase.execute({ jobId: policyId })

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

  const { policy, signals, prohibitedTopics } = result.value
  return c.json(
    {
      data: {
        policy: serializeReviewPolicyVersion(policy),
        signals: signals.map(serializeReviewPolicySignal),
        prohibitedTopics: prohibitedTopics.map(serializeReviewProhibitedTopic),
      },
    },
    200
  )
})

export default app
