import { FormField } from '@ding/domain/domain/entity'
import { FormId, FormFieldId, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formFieldResponseSchema } from '../../../../schemas/response'
import { serializeFormField } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

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

  const fields = body.fields.map((f, index) => {
    const fieldId = f.id
      ? FormFieldId.fromString(f.id)
      : FormFieldId.fromString(crypto.randomUUID())
    return FormField.create({
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
  })

  // Delete existing fields and save new ones
  await repositories.formRepository.deleteFormFieldsByFormId(formIdVO)

  if (fields.length > 0) {
    const saveResult = await repositories.formRepository.saveFormFields(fields)
    if (!saveResult.success) {
      return c.json({ error: 'Failed to save form fields' }, 500)
    }
  }

  return c.json({ data: fields.map(serializeFormField) }, 200)
})

export default app
