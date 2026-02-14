import { SubmissionId, ChatSessionId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  collectedFieldResponseSchema,
  formFieldResponseSchema,
} from '../../../../../../../schemas/response'
import {
  serializeCollectedField,
  serializeFormField,
} from '../../../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{submissionId}/chat/sessions/{sessionId}/form-data',
  operationId: 'getChatSessionFormData',
  tags: ['Chat'],
  summary: 'Get collected form data for a chat session',
  request: {
    params: z.object({
      submissionId: z.string(),
      sessionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Form data',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              fields: z.array(formFieldResponseSchema),
              collectedFields: z.record(z.string(), collectedFieldResponseSchema),
            }),
          }),
        },
      },
    },
    404: {
      description: 'Session not found',
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
  const { submissionId, sessionId } = c.req.valid('param')

  const submissionIdVO = SubmissionId.fromString(submissionId)
  const sessionIdVO = ChatSessionId.fromString(sessionId)

  // Get session
  const sessionResult = await repositories.submissionRepository.findChatSessionById(sessionIdVO)
  if (!sessionResult.success) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // Get submission
  const submissionResult = await repositories.submissionRepository.findById(submissionIdVO)
  if (!submissionResult.success) {
    return c.json({ error: 'Submission not found' }, 404)
  }
  const submission = submissionResult.value

  // Get form fields
  const formFieldsResult = await repositories.formRepository.findFormFieldsByFormId(
    submission.formId
  )
  if (!formFieldsResult.success) {
    return c.json({ error: 'Failed to load form fields' }, 500)
  }

  // Get collected fields
  const collectedFieldsResult =
    await repositories.submissionRepository.findCollectedFieldsBySubmissionId(submissionIdVO)
  if (!collectedFieldsResult.success) {
    return c.json({ error: 'Failed to load collected fields' }, 500)
  }

  // Map collected fields by form field id
  const collectedFieldsMap: Record<string, ReturnType<typeof serializeCollectedField>> = {}
  for (const field of collectedFieldsResult.value) {
    collectedFieldsMap[field.formFieldId.value] = serializeCollectedField(field)
  }

  return c.json(
    {
      data: {
        fields: formFieldsResult.value.map(serializeFormField),
        collectedFields: collectedFieldsMap,
      },
    },
    200
  )
})

export default app
