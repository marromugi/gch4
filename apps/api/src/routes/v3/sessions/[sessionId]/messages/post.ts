import { OrchestratorV3, ConsoleLogger } from '@ding/agent'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import {
  sendV3MessageRequestSchema,
  v3MessageResponseSchema,
  v3LlmErrorResponseSchema,
} from '../../../../../schemas/v3'
import type { HonoEnv } from '../../../../../types/hono'
import type { Plan, PlanField } from '@ding/agent'

const route = createRoute({
  method: 'post',
  path: '/{sessionId}/messages',
  operationId: 'sendV3Message',
  tags: ['V3'],
  summary: 'Send a message to a V3 interview session',
  request: {
    params: z.object({
      sessionId: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: sendV3MessageRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Message processed',
      content: {
        'application/json': {
          schema: z.object({
            data: v3MessageResponseSchema,
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
      description: 'Internal server error (may include fallback data for LLM errors)',
      content: {
        'application/json': {
          schema: z.union([z.object({ error: z.string() }), v3LlmErrorResponseSchema]),
        },
      },
    },
  },
})

const app = new OpenAPIHono<HonoEnv>()

app.openapi(route, async (c) => {
  const { infrastructure } = c.get('di')
  const { sessionId } = c.req.valid('param')
  const { message } = c.req.valid('json')

  const logger = new ConsoleLogger('[OrchestratorV3]')
  const orchestrator = new OrchestratorV3({
    kvStore: infrastructure.kvStore,
    registry: infrastructure.agentRegistry,
    provider: infrastructure.llmProvider,
    logger,
  })

  try {
    const result = await orchestrator.process(sessionId, message)

    return c.json(
      {
        data: {
          response: result.responseText,
          stage: result.currentStage,
          isComplete: result.isComplete,
          ...(result.isComplete && result.collectedFields
            ? { collectedFields: result.collectedFields }
            : {}),
          ...(result.askOptions ? { askOptions: result.askOptions } : {}),
        },
      },
      200
    )
  } catch (error) {
    console.error('Failed to process V3 message:', error)
    // セッションが見つからない場合
    if (error instanceof Error && error.message.includes('not found')) {
      return c.json({ error: 'Session not found' }, 404)
    }

    // LLMエラー時: セッション状態を取得してフォールバックデータを返す
    try {
      const sessionState = await orchestrator.getSessionState(sessionId)
      if (sessionState) {
        const plan = sessionState.plan as Plan | undefined
        const collectedFieldIds = Object.keys(sessionState.collectedFields)
        const remainingFieldIds =
          plan?.fields
            .filter((f: PlanField) => !collectedFieldIds.includes(f.fieldId))
            .map((f: PlanField) => f.fieldId) ?? []

        return c.json(
          {
            error: 'LLMエラーが発生しました。フォームから入力してください。',
            errorType: 'LLM_ERROR' as const,
            collectedFields: sessionState.collectedFields,
            remainingFieldIds,
            currentStage: sessionState.stage,
          },
          500
        )
      }
    } catch {
      // セッション取得も失敗した場合はフォールスルー
    }

    return c.json({ error: 'Failed to process message' }, 500)
  }
})

export default app
