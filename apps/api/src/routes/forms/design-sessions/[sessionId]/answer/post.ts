import { DesignSessionOrchestrator } from '@ding/agent'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../../../types/hono'

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
  path: '/{sessionId}/answer',
  operationId: 'answerDesignSession',
  tags: ['FormDesign'],
  summary: 'Answer questions in the design session',
  request: {
    params: z.object({
      sessionId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            answers: z.array(
              z.object({
                questionId: z.string(),
                selectedOptionIds: z.array(z.string()),
                freeText: z.string().optional(),
              })
            ),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Answer processed',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              status: z.enum(['asking', 'completed']),
              questions: z.array(questionSchema).optional(),
              fields: z.array(fieldSchema).optional(),
            }),
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.object({ error: z.string() }),
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
  const body = c.req.valid('json')

  const orchestrator = new DesignSessionOrchestrator({
    kvStore: infrastructure.kvStore,
    provider: infrastructure.llmProvider,
    logger: infrastructure.logger,
  })

  try {
    const result = await orchestrator.answer(sessionId, body.answers)

    return c.json(
      {
        data: {
          status: result.status,
          questions: result.questions,
          fields: result.fields,
        },
      },
      200
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: 'Session not found' }, 404)
    }
    if (error instanceof Error && error.message.includes('already completed')) {
      return c.json({ error: 'Session already completed' }, 400)
    }
    console.error('Failed to process answer:', error)
    return c.json({ error: 'Failed to process answer' }, 500)
  }
})

export default app
