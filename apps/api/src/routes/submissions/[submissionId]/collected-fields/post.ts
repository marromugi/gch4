import { CollectedField } from '@ding/domain/domain/entity'
import {
  SubmissionId,
  CollectedFieldId,
  FormFieldId,
  CollectedFieldSource,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { collectedFieldResponseSchema } from '../../../../schemas/response'
import { serializeCollectedField } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{submissionId}/collected-fields',
  operationId: 'saveCollectedField',
  tags: ['Submission'],
  summary: 'Save a collected field',
  request: {
    params: z.object({
      submissionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            formFieldId: z.string(),
            value: z.string(),
            source: z.enum(['llm', 'manual']),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Field saved',
      content: {
        'application/json': {
          schema: z.object({
            data: collectedFieldResponseSchema,
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
  const body = c.req.valid('json')

  const submissionIdVO = SubmissionId.fromString(submissionId)

  const submissionResult = await repositories.submissionRepository.findById(submissionIdVO)
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }

  const now = new Date()

  const field = CollectedField.create({
    id: CollectedFieldId.fromString(crypto.randomUUID()),
    submissionId: submissionIdVO,
    formFieldId: FormFieldId.fromString(body.formFieldId),
    value: body.value,
    source: CollectedFieldSource.from(body.source),
    confirmed: false,
    createdAt: now,
    updatedAt: now,
  })

  const saveResult = await repositories.submissionRepository.saveCollectedField(field)
  if (!saveResult.success) {
    return c.json({ error: 'Failed to save collected field' }, 500)
  }

  return c.json({ data: serializeCollectedField(field) }, 201)
})

export default app
