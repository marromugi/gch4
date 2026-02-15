import { Submission } from '@ding/domain/domain/entity'
import {
  SubmissionId,
  FormId,
  FormSchemaVersionId,
  SubmissionStatus,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { submissionResponseSchema } from '../../schemas/response'
import { serializeSubmission } from '../../schemas/serializers'
import type { HonoEnv } from '../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createSubmission',
  tags: ['Submission'],
  summary: 'Create a new submission',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            submissionId: z.string().optional(),
            formId: z.string(),
            schemaVersionId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Submission created',
      content: {
        'application/json': {
          schema: z.object({
            data: submissionResponseSchema,
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
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
  const body = c.req.valid('json')

  const formId = FormId.fromString(body.formId)

  // Verify form exists
  const formResult = await repositories.formRepository.findById(formId)
  if (!formResult.success) {
    return c.json({ error: 'Form not found' }, 404)
  }

  // Verify schema version exists
  const schemaVersionId = FormSchemaVersionId.fromString(body.schemaVersionId)
  const schemaResult = await repositories.formRepository.findSchemaVersionById(schemaVersionId)
  if (!schemaResult.success) {
    return c.json({ error: 'Schema version not found' }, 404)
  }

  const now = new Date()

  const submission = Submission.create({
    id: SubmissionId.fromString(body.submissionId ?? crypto.randomUUID()),
    formId,
    schemaVersionId,
    respondentName: null,
    respondentEmail: null,
    language: null,
    status: SubmissionStatus.new(),
    reviewCompletedAt: null,
    consentCheckedAt: null,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  })

  const saveResult = await repositories.submissionRepository.save(submission)
  if (!saveResult.success) {
    return c.json({ error: 'Failed to save submission' }, 500)
  }

  return c.json({ data: serializeSubmission(submission) }, 201)
})

export default app
