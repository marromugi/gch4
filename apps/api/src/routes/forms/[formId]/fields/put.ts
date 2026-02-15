import { FormField, FieldCompletionCriteria } from '@ding/domain/domain/entity'
import {
  FormId,
  FormFieldId,
  UserId,
  FieldCompletionCriteriaId,
} from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formFieldResponseSchema } from '../../../../schemas/response'
import { serializeFormField } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const criteriaInputSchema = z.object({
  id: z.string().optional(),
  criteriaKey: z.string(),
  criteria: z.string(),
  doneCondition: z.string(),
  questioningHints: z.string().nullable().optional(),
})

const route = createRoute({
  method: 'put',
  path: '/{formId}/fields',
  operationId: 'saveFormFields',
  tags: ['Form'],
  summary: 'Save form fields',
  request: {
    params: z.object({
      formId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            fields: z.array(
              z.object({
                id: z.string().optional(),
                label: z.string(),
                description: z.string().nullable().optional(),
                intent: z.string().nullable().optional(),
                required: z.boolean().optional(),
                criteria: z.array(criteriaInputSchema).optional(),
                boundaries: z.array(z.string()).optional(),
              })
            ),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Form fields saved',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(formFieldResponseSchema),
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
  const body = c.req.valid('json')

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

  const now = new Date()

  // Get the latest schema version for criteria
  const schemaResult = await repositories.formRepository.findLatestSchemaVersionByFormId(formIdVO)
  if (!schemaResult.success || !schemaResult.value) {
    return c.json({ error: 'Schema version not found' }, 404)
  }
  const schemaVersionId = schemaResult.value.id

  const fields: FormField[] = []
  const completionCriteria: FieldCompletionCriteria[] = []

  for (const [index, f] of body.fields.entries()) {
    const fieldId = f.id
      ? FormFieldId.fromString(f.id)
      : FormFieldId.fromString(crypto.randomUUID())

    fields.push(
      FormField.create({
        id: fieldId,
        formId: formIdVO,
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
      for (const criteria of f.criteria) {
        completionCriteria.push(
          FieldCompletionCriteria.create({
            id: FieldCompletionCriteriaId.fromString(crypto.randomUUID()),
            schemaVersionId,
            formFieldId: fieldId,
            criteriaKey: criteria.criteriaKey,
            criteria: criteria.criteria,
            doneCondition: criteria.doneCondition,
            questioningHints: criteria.questioningHints ?? null,
            boundaries: f.boundaries ?? null,
            sortOrder: index,
            createdAt: now,
          })
        )
      }
    }
  }

  // Delete existing fields and criteria
  await repositories.formRepository.deleteFormFieldsByFormId(formIdVO)
  await repositories.formRepository.deleteCompletionCriteriaBySchemaVersionId(schemaVersionId)

  // Save new fields
  if (fields.length > 0) {
    const saveResult = await repositories.formRepository.saveFormFields(fields)
    if (!saveResult.success) {
      return c.json({ error: 'Failed to save form fields' }, 500)
    }
  }

  // Save new completion criteria
  if (completionCriteria.length > 0) {
    const saveCriteriaResult =
      await repositories.formRepository.saveCompletionCriteria(completionCriteria)
    if (!saveCriteriaResult.success) {
      return c.json({ error: 'Failed to save completion criteria' }, 500)
    }
  }

  return c.json({ data: fields.map(serializeFormField) }, 200)
})

export default app
