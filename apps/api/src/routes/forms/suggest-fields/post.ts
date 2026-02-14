import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/suggest-fields',
  operationId: 'suggestFormFields',
  tags: ['Form'],
  summary: 'Suggest form fields based on natural language description',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            description: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Suggested fields',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              fields: z.array(
                z.object({
                  label: z.string(),
                  description: z.string().nullable(),
                  intent: z.string().nullable(),
                  required: z.boolean(),
                })
              ),
            }),
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

  const { infrastructure } = c.get('di')
  const body = c.req.valid('json')

  try {
    const systemPrompt = `You are a form design assistant. Based on the user's description, suggest appropriate form fields.
Return a JSON array of field objects with the following structure:
- label: string (field label shown to users)
- description: string | null (optional help text)
- intent: string | null (what information this field collects)
- required: boolean (whether this field is required)

Only return the JSON array, no other text.`

    const result = await infrastructure.llmProvider.chat(
      [
        {
          role: 'user',
          content: `Please suggest form fields for the following purpose: ${body.description}`,
        },
      ],
      { systemPrompt }
    )

    const fields = JSON.parse(result.text)

    return c.json({ data: { fields } }, 200)
  } catch (e) {
    console.error('Failed to suggest fields:', e)
    return c.json({ error: 'Failed to generate field suggestions' }, 500)
  }
})

export default app
