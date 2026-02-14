import { FormId, FormStatus, UserId } from '@ding/domain/domain/valueObject'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formFieldResponseSchema } from '../../../../schemas/response'
import { serializeFormField } from '../../../../schemas/serializers'
import type { HonoEnv } from '../../../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/{formId}/fields',
  operationId: 'getFormFields',
  tags: ['Form'],
  summary: 'Get form fields',
  request: {
    params: z.object({
      formId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Form fields',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(formFieldResponseSchema),
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

  const fieldsResult = await repositories.formRepository.findFormFieldsByFormId(formIdVO)
  if (!fieldsResult.success) {
    return c.json({ error: 'Failed to load form fields' }, 500)
  }

  return c.json({ data: fieldsResult.value.map(serializeFormField) }, 200)
})

export default app
