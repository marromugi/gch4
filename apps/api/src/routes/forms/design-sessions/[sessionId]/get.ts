import { DesignSessionOrchestrator } from '@ding/agent'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../../types/hono'

const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
  selectionType: z.enum(['radio', 'checkbox']),
})

const fieldSchema = z.object({
  fieldId: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  intent: z.string().nullable(),
  required: z.boolean(),
  sortOrder: z.number(),
})

const route = createRoute({
  method: 'get',
  path: '/{sessionId}',
  operationId: 'getDesignSession',
  tags: ['FormDesign'],
  summary: 'Get design session state',
  request: {
    params: z.object({
      sessionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Session state',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              sessionId: z.string(),
              purpose: z.string(),
              status: z.enum(['asking', 'generating', 'completed']),
              questions: z.array(questionSchema).optional(),
              fields: z.array(fieldSchema).optional(),
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
    const session = await orchestrator.getSessionState(sessionId)
    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }

    return c.json(
      {
        data: {
          sessionId: session.sessionId,
          purpose: session.purpose,
          status: session.status,
          questions: session.pendingQuestions.length > 0 ? session.pendingQuestions : undefined,
          fields: session.generatedFields,
        },
      },
      200
    )
  } catch (error) {
    console.error('Failed to get design session:', error)
    return c.json({ error: 'Failed to get design session' }, 500)
  }
})

export default app
