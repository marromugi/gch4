import { ListFormsByUserUsecase } from '@ding/domain/presentation/usecase'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { formWithCountResponseSchema } from '../../schemas/response'
import { serializeFormWithCount } from '../../schemas/serializers'
import type { HonoEnv } from '../../types/hono'

const route = createRoute({
  method: 'get',
  path: '/',
  operationId: 'listForms',
  tags: ['Form'],
  summary: 'List all forms',
  responses: {
    200: {
      description: 'List of forms',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(formWithCountResponseSchema),
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

  const usecase = new ListFormsByUserUsecase({
    formRepository: repositories.formRepository,
    submissionRepository: repositories.submissionRepository,
  })

  const result = await usecase.execute({ userId: user.id })

  if (!result.success) {
    return c.json({ error: result.error.message }, 500)
  }

  return c.json(
    {
      data: result.value.map((item) => serializeFormWithCount(item.form, item.submissionCount)),
    },
    200
  )
})

export default app
