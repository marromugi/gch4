import { FormId, FormSchemaVersionStatus, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formSchemaVersionResponseSchema } from '../../../../../schemas/response'
import { serializeFormSchemaVersion } from '../../../../../schemas/serializers'
import type { HonoEnv } from '../../../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/{formId}/schema/approve',
  operationId: 'approveFormSchemaVersion',
  tags: ['Form'],
  summary: 'Approve form schema version',
  request: {
    params: z.object({
      formId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Schema version approved',
      content: {
        'application/json': {
          schema: z.object({
            data: formSchemaVersionResponseSchema,
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

  const schemaResult = await repositories.formRepository.findLatestSchemaVersionByFormId(formIdVO)
  if (!schemaResult.success) {
    return c.json({ error: 'Schema not found' }, 404)
  }

  const schemaVersion = schemaResult.value
  if (!schemaVersion) {
    return c.json({ error: 'No schema version found' }, 404)
  }

  if (schemaVersion.status.equals(FormSchemaVersionStatus.approved())) {
    return c.json({ error: 'Schema is already approved' }, 400)
  }

  const approvedSchema = schemaVersion.approve()

  const saveResult = await repositories.formRepository.saveSchemaVersion(approvedSchema)
  if (!saveResult.success) {
    return c.json({ error: 'Failed to save schema version' }, 500)
  }

  return c.json({ data: serializeFormSchemaVersion(approvedSchema) }, 200)
})

export default app
