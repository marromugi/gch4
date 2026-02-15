import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../types/hono'

const route = createRoute({
  method: 'post',
  path: '/suggest-theme',
  operationId: 'suggestFormTheme',
  tags: ['Form'],
  summary: 'Suggest a demo form theme with title and completion message',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            category: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Suggested theme',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              title: z.string(),
              purpose: z.string(),
              completionMessage: z.string(),
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
    const systemPrompt = `あなたはフォームデザインアシスタントです。デモ用のフォームテーマを提案してください。

以下のJSON形式で返答してください：
{
  "title": "フォームのタイトル（20文字以内）",
  "purpose": "フォームの目的・用途の説明（100文字以内）",
  "completionMessage": "フォーム送信完了後に表示するメッセージ（100文字以内）"
}

テーマは以下のカテゴリからランダムに選んで、具体的で実用的なものを生成してください：
- お問い合わせフォーム（製品、サービス、カスタマーサポート）
- アンケート・調査フォーム（顧客満足度、イベント後フィードバック）
- 申込フォーム（イベント参加、サービス申込、会員登録）
- 予約フォーム（レストラン、サロン、コンサルティング）
- 採用・応募フォーム（求人応募、インターン応募）

JSON以外のテキストは返さないでください。`

    const userPrompt = body.category
      ? `「${body.category}」カテゴリのフォームテーマを1つ提案してください。`
      : 'デモ用のフォームテーマをランダムに1つ提案してください。'

    const result = await infrastructure.llmProvider.chat(
      [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      { systemPrompt }
    )

    // マークダウンのコードブロックからJSONを抽出
    let jsonText = result.text.trim()
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim()
    }

    const theme = JSON.parse(jsonText)

    return c.json({ data: theme }, 200)
  } catch (e) {
    console.error('Failed to suggest theme:', e)
    return c.json({ error: 'Failed to generate theme suggestion' }, 500)
  }
})

export default app
