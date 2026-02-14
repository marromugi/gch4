import { FormId, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { submissionResponseSchema } from '../../../../schemas/response'
import { serializeSubmission } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{formId}/submissions',
  operationId: 'listFormSubmissions',
  tags: ['Form'],
  summary: 'List submissions for a form',
  request: {
    params: z.object({
      formId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'List of submissions',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(submissionResponseSchema),
          }),
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
    403: {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    404: {
      description: 'Form not found',
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
  const user = c.get('user')
  const { formId } = c.req.valid('param')

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const formIdVO = FormId.fromString(formId)

  const formResult = await repositories.formRepository.findById(formIdVO)
  if (!formResult.success) {
    return c.json({ error: 'Form not found' }, 404)
  }

  if (!formResult.value.createdBy.equals(UserId.fromString(user.id))) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const result = await repositories.submissionRepository.findByFormId(formIdVO)
  if (!result.success) {
    return c.json({ error: 'Failed to load submissions' }, 500)
  }

  return c.json({ data: result.value.map(serializeSubmission) }, 200)
})

export default app
