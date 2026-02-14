import { FormId, FormStatus, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  formSchemaVersionResponseSchema,
  fieldCompletionCriteriaResponseSchema,
} from '../../../../schemas/response'
import {
  serializeFormSchemaVersion,
  serializeFieldCompletionCriteria,
} from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{formId}/schema',
  operationId: 'getFormSchema',
  tags: ['Form'],
  summary: 'Get form schema',
  request: {
    params: z.object({
      formId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Form schema',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              schemaVersion: formSchemaVersionResponseSchema,
              completionCriteria: z.array(fieldCompletionCriteriaResponseSchema),
            }),
          }),
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
      description: 'Form or schema not found',
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

  const formIdVO = FormId.fromString(formId)

  const formResult = await repositories.formRepository.findById(formIdVO)
  if (!formResult.success) {
    return c.json({ error: 'Form not found' }, 404)
  }

  const form = formResult.value
  const isOwner = user && form.createdBy.equals(UserId.fromString(user.id))
  const isPublished = form.status.equals(FormStatus.published())

  if (!isOwner && !isPublished) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const schemaResult = await repositories.formRepository.findLatestSchemaVersionByFormId(formIdVO)
  if (!schemaResult.success) {
    return c.json({ error: 'Schema not found' }, 404)
  }

  const schemaVersion = schemaResult.value
  if (!schemaVersion) {
    return c.json({ error: 'No schema version found' }, 404)
  }

  const criteriaResult = await repositories.formRepository.findCompletionCriteriaBySchemaVersionId(
    schemaVersion.id
  )
  if (!criteriaResult.success) {
    return c.json({ error: 'Failed to load completion criteria' }, 500)
  }

  return c.json(
    {
      data: {
        schemaVersion: serializeFormSchemaVersion(schemaVersion),
        completionCriteria: criteriaResult.value.map(serializeFieldCompletionCriteria),
      },
    },
    200
  )
})

export default app
