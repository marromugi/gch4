import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { streamSSE } from 'hono/streaming'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/suggest-culture-context',
  operationId: 'suggestCultureContext',
  tags: ['Job'],
  summary: 'Suggest culture context description via SSE',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'SSE stream',
    },
    400: {
      description: 'Bad request',
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
  const body = c.req.valid('json')

  if (!body.title) {
    return c.json({ error: 'title is required' }, 400)
  }

  const prompt = `あなたは採用のプロフェッショナルです。以下の求人タイトルに基づいて、チームや会社のカルチャー背景を生成してください。
どのような文化・価値観のチームかを3〜5文程度で記述してください。区切り文字やラベルは不要で、本文のみ出力してください。

求人タイトル: ${body.title}`

  return streamSSE(c, async (stream) => {
    try {
      let id = 0
      let totalText = ''
      console.log('[suggest-culture-context] streaming start')

      const generator = infrastructure.llmProvider.generateTextStream(prompt, {
        temperature: 0.7,
        maxOutputTokens: 1024,
        thinkingBudget: 0,
      })

      for await (const chunk of generator) {
        totalText += chunk
        console.log(`[suggest-culture-context] chunk #${id}: ${chunk.length} chars`)
        await stream.writeSSE({ data: chunk, event: 'chunk', id: String(id++) })
      }

      console.log(`[suggest-culture-context] done: ${id} chunks, ${totalText.length} chars total`)
      await stream.writeSSE({ data: '', event: 'done', id: String(id++) })
    } catch (error) {
      console.error('[suggest-culture-context] error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      await stream.writeSSE({ data: message, event: 'error', id: '0' })
    }
  })
})

export default app
