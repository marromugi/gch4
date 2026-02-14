import {
  SubmissionId,
  CollectedFieldId,
  CollectedFieldSource,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { collectedFieldResponseSchema } from '../../../../../schemas/response'
import { serializeCollectedField } from '../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../types/hono'

const route = createRoute({
  method: 'put',
  path: '/{submissionId}/collected-fields/{fieldId}',
  operationId: 'updateCollectedField',
  tags: ['Submission'],
  summary: 'Update a collected field',
  request: {
    params: z.object({
      submissionId: z.string(),
      fieldId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            value: z.string(),
            confirmed: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Field updated',
      content: {
        'application/json': {
          schema: z.object({
            data: collectedFieldResponseSchema,
          }),
        },
      },
    },
    404: {
      description: 'Submission or field not found',
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
  const { submissionId, fieldId } = c.req.valid('param')
  const body = c.req.valid('json')

  const submissionIdVO = SubmissionId.fromString(submissionId)

  const submissionResult = await repositories.submissionRepository.findById(submissionIdVO)
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }

  const fieldResult = await repositories.submissionRepository.findCollectedFieldById(
    CollectedFieldId.fromString(fieldId)
  )
  if (!fieldResult.success) {
    return c.json({ error: 'Field not found' }, 404)
  }

  let field = fieldResult.value.updateValue(body.value, CollectedFieldSource.manual())
  if (body.confirmed !== undefined) {
    field = body.confirmed ? field.confirm() : field
  }

  const saveResult = await repositories.submissionRepository.saveCollectedField(field)
  if (!saveResult.success) {
    return c.json({ error: 'Failed to save collected field' }, 500)
  }

  return c.json({ data: serializeCollectedField(field) }, 200)
})

export default app
