import { Form, FormField, FormSchemaVersion } from '@ding/domain/domain/entity'
import {
  FormId,
  FormFieldId,
  FormSchemaVersionId,
  FormStatus,
  FormSchemaVersionStatus,
  UserId,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formResponseSchema } from '../../schemas/response'
import { serializeForm } from '../../schemas/serializers'
import type { HonoEnv } from '../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createForm',
  tags: ['Form'],
  summary: 'Create a new form',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string(),
            description: z.string().nullable().optional(),
            purpose: z.string().nullable().optional(),
            completionMessage: z.string().nullable().optional(),
            fields: z
              .array(
                z.object({
                  label: z.string(),
                  description: z.string().nullable().optional(),
                  intent: z.string().nullable().optional(),
                  required: z.boolean().optional(),
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
      description: 'Form created',
      content: {
        'application/json': {
          schema: z.object({
            data: formResponseSchema,
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
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { repositories } = c.get('di')
  const body = c.req.valid('json')

  const now = new Date()
  const formId = FormId.fromString(crypto.randomUUID())

  // Create Form
  const form = Form.create({
    id: formId,
    title: body.title,
    description: body.description ?? null,
    purpose: body.purpose ?? null,
    completionMessage: body.completionMessage ?? null,
    status: FormStatus.draft(),
    createdBy: UserId.fromString(user.id),
    createdAt: now,
    updatedAt: now,
  })

  // Create FormFields
  const fields = (body.fields ?? []).map((f, index) => {
    const fieldId = FormFieldId.fromString(crypto.randomUUID())
    return FormField.create({
      id: fieldId,
      formId,
      fieldId: `field_${index + 1}`,
      label: f.label,
      description: f.description ?? null,
      intent: f.intent ?? null,
      required: f.required ?? false,
      sortOrder: index,
      createdAt: now,
      updatedAt: now,
    })
  })

  // Create FormSchemaVersion (draft)
  const schemaVersion = FormSchemaVersion.create({
    id: FormSchemaVersionId.fromString(crypto.randomUUID()),
    formId,
    version: 1,
    status: FormSchemaVersionStatus.draft(),
    approvedAt: null,
    createdAt: now,
  })

  // Save
  const saveFormResult = await repositories.formRepository.save(form)
  if (!saveFormResult.success) {
    return c.json({ error: 'Failed to save form' }, 500)
  }

  if (fields.length > 0) {
    const saveFieldsResult = await repositories.formRepository.saveFormFields(fields)
    if (!saveFieldsResult.success) {
      return c.json({ error: 'Failed to save form fields' }, 500)
    }
  }

  const saveSchemaResult = await repositories.formRepository.saveSchemaVersion(schemaVersion)
  if (!saveSchemaResult.success) {
    return c.json({ error: 'Failed to save schema version' }, 500)
  }

  return c.json({ data: serializeForm(form) }, 201)
})

export default app
