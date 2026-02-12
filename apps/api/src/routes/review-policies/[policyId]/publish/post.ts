import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { PublishReviewPolicyUsecase } from '@ding/domain'
import type { HonoEnv } from '../../../../types/hono'
import { reviewPolicyVersionResponseSchema } from '../../../../schemas/response'
import { serializeReviewPolicyVersion } from '../../../../schemas/serializers'

const route = createRoute({
  method: 'post',
  path: '/{policyId}/publish',
  operationId: 'publishReviewPolicy',
  tags: ['ReviewPolicy'],
  summary: 'Publish a review policy',
  request: {
    params: z.object({
      policyId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Review policy published',
      content: {
        'application/json': {
          schema: z.object({
            data: reviewPolicyVersionResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Validation error or status error',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    404: {
      description: 'Not found',
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

  const usecase = new PublishReviewPolicyUsecase({
    reviewPolicyRepository: repositories.reviewPolicyRepository,
  })

  const result = await usecase.execute({
    reviewPolicyVersionId: policyId,
  })

  if (!result.success) {
    const error = result.error
    if (error.type === 'validation_error') {
      return c.json({ error: error.message }, 400)
    }
    if (error.type === 'not_found_error') {
      return c.json({ error: error.message }, 404)
    }
    if (error.type === 'status_error') {
      return c.json({ error: error.message }, 400)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data: serializeReviewPolicyVersion(result.value) }, 200)
})

export default app
