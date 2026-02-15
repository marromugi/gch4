import {
  Form,
  FormField,
  FormSchemaVersion,
  FieldCompletionCriteria,
} from '@ding/domain/domain/entity'
import {
  FormId,
  FormFieldId,
  FormSchemaVersionId,
  FormStatus,
  FormSchemaVersionStatus,
  UserId,
  FieldCompletionCriteriaId,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formResponseSchema } from '../../schemas/response'
import { serializeForm } from '../../schemas/serializers'
import type { HonoEnv } from '../../types/hono'

const criteriaInputSchema = z.object({
  criteriaKey: z.string(),
  criteria: z.string(),
  doneCondition: z.string(),
  questioningHints: z.string().nullable().optional(),
})

const fieldInputSchema = z.object({
  label: z.string(),
  description: z.string().nullable().optional(),
  intent: z.string().nullable().optional(),
  required: z.boolean().optional(),
  criteria: z.array(criteriaInputSchema).optional(),
  boundaries: z.array(z.string()).optional(),
})

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
            fields: z.array(fieldInputSchema).optional(),
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

  // Create FormSchemaVersion (auto-approved)
  const schemaVersionId = FormSchemaVersionId.fromString(crypto.randomUUID())
  const schemaVersion = FormSchemaVersion.create({
    id: schemaVersionId,
    formId,
    version: 1,
    status: FormSchemaVersionStatus.approved(),
    approvedAt: now,
    createdAt: now,
  })

  // Create FormFields and FieldCompletionCriteria
  const fields: FormField[] = []
  const completionCriteria: FieldCompletionCriteria[] = []

  for (const [index, f] of (body.fields ?? []).entries()) {
    const fieldId = FormFieldId.fromString(crypto.randomUUID())

    fields.push(
      FormField.create({
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
    )

    // Create FieldCompletionCriteria if criteria is provided
    if (f.criteria && f.criteria.length > 0) {
      for (const c of f.criteria) {
        completionCriteria.push(
          FieldCompletionCriteria.create({
            id: FieldCompletionCriteriaId.fromString(crypto.randomUUID()),
            schemaVersionId,
            formFieldId: fieldId,
            criteriaKey: c.criteriaKey,
            criteria: c.criteria,
            doneCondition: c.doneCondition,
            questioningHints: c.questioningHints ?? null,
            boundaries: f.boundaries ?? null,
            sortOrder: index,
            createdAt: now,
          })
        )
      }
    }
  }

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

  if (completionCriteria.length > 0) {
    const saveCriteriaResult =
      await repositories.formRepository.saveCompletionCriteria(completionCriteria)
    if (!saveCriteriaResult.success) {
      return c.json({ error: 'Failed to save completion criteria' }, 500)
    }
  }

  return c.json({ data: serializeForm(form) }, 201)
})

export default app
