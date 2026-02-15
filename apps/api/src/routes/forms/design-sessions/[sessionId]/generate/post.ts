import { DesignSessionOrchestrator } from '@ding/agent'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../../../types/hono'

const criteriaSchema = z.object({
  criteriaKey: z.string(),
  criteria: z.string(),
  doneCondition: z.string(),
  questioningHints: z.string().nullable(),
})

const fieldSchema = z.object({
  fieldId: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  intent: z.string().nullable(),
  required: z.boolean(),
  sortOrder: z.number(),
  criteria: z.array(criteriaSchema),
  boundaries: z.array(z.string()),
})

const route = createRoute({
  method: 'post',
  path: '/{sessionId}/generate',
  operationId: 'generateFieldsFromSession',
  tags: ['FormDesign'],
  summary: 'Force generate fields (early exit)',
  request: {
    params: z.object({
      sessionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Fields generated',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              fields: z.array(fieldSchema),
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
  const { infrastructure } = c.get('di')
  const { sessionId } = c.req.valid('param')

  const orchestrator = new DesignSessionOrchestrator({
    kvStore: infrastructure.kvStore,
    provider: infrastructure.llmProvider,
    logger: infrastructure.logger,
  })

  try {
    const result = await orchestrator.generateNow(sessionId)

    return c.json(
      {
        data: {
          fields: result.fields ?? [],
        },
      },
      200
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: 'Session not found' }, 404)
    }
    console.error('Failed to generate fields:', error)
    return c.json({ error: 'Failed to generate fields' }, 500)
  }
})

export default app
