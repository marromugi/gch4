import { DesignSessionOrchestrator } from '@ding/agent'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../types/hono'

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

const route = createRoute({
  method: 'post',
  path: '/',
  operationId: 'createDesignSession',
  tags: ['FormDesign'],
  summary: 'Start a new form design session',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            purpose: z.string().min(1).describe('フォームの目的'),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Session created',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              sessionId: z.string(),
              status: z.enum(['asking', 'completed']),
              questions: z.array(questionSchema).optional(),
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

  const sessionId = crypto.randomUUID()

  const orchestrator = new DesignSessionOrchestrator({
    kvStore: infrastructure.kvStore,
    provider: infrastructure.llmProvider,
    logger: infrastructure.logger,
  })

  try {
    const result = await orchestrator.start(sessionId, body.purpose)

    return c.json(
      {
        data: {
          sessionId: result.sessionId,
          status: result.status,
          questions: result.questions,
        },
      },
      201
    )
  } catch (error) {
    console.error('Failed to start design session:', error)
    return c.json({ error: 'Failed to start design session' }, 500)
  }
})

export default app
