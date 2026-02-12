import { LLMProviderError } from '@ding/agent/provider'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { HonoEnv } from '../../../types/hono'
import type { LLMMessage } from '@ding/agent/provider'

interface FormFieldsResponse {
  formFields: { label: string; intent: string; required: boolean }[]
}

const MAX_RETRIES = 5

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    formFields: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          intent: { type: 'string' },
          required: { type: 'boolean' },
        },
        required: ['label', 'intent', 'required'],
      },
    },
  },
  required: ['formFields'],
} as const

const RAW_TEXT_PREFIX = 'Failed to parse structured response: '

function extractRawText(errorMessage: string): string {
  if (errorMessage.startsWith(RAW_TEXT_PREFIX)) {
    return errorMessage.slice(RAW_TEXT_PREFIX.length)
  }
  return errorMessage
}

const route = createRoute({
  method: 'post',
  path: '/suggest-form-fields',
  operationId: 'suggestFormFields',
  tags: ['Job'],
  summary: 'Suggest form fields for a job',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string(),
            idealCandidate: z.string().nullable().optional(),
            cultureContext: z.string().nullable().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Suggested form fields',
      content: {
        'application/json': {
          schema: z.object({
            formFields: z.array(
              z.object({
                label: z.string(),
                intent: z.string(),
                required: z.boolean(),
              })
            ),
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
  const body = c.req.valid('json')

  if (!body.title) {
    return c.json({ error: 'title is required' }, 400)
  }

  const prompt = `あなたは採用フォーム設計のプロフェッショナルです。
以下の求人情報に基づいて、応募フォームの項目を生成してください。

【ルール】
- 「氏名」「メールアドレス」は必ず含め、required: true にすること
- 各項目には intent（その項目で何を見たいか）を簡潔に設定すること
- 求人の特性に合わせた項目を5〜10個程度生成すること
- 一般的すぎる項目は避け、求人に特化した項目を含めること
- label は短く簡潔にすること（質問文ではなく項目名にする）
- intent も1文以内で簡潔に記述すること

求人タイトル: ${body.title}
理想の人物像: ${body.idealCandidate ?? '未設定'}
カルチャー: ${body.cultureContext ?? '未設定'}`

  const structuredOptions = {
    temperature: 0.7,
    maxOutputTokens: 4096,
    thinkingBudget: 0,
    responseSchema: RESPONSE_SCHEMA,
  }

  try {
    console.log('[suggest-form-fields] generating structured output')

    // 初回試行
    const result = await infrastructure.llmProvider.generateStructuredOutput<FormFieldsResponse>(
      prompt,
      structuredOptions
    )

    console.log(`[suggest-form-fields] done: ${result.data.formFields.length} fields generated`)
    return c.json({ formFields: result.data.formFields }, 200)
  } catch (firstError) {
    if (!(firstError instanceof LLMProviderError && firstError.type === 'SCHEMA_VALIDATION')) {
      console.error('[suggest-form-fields] error:', firstError)
      const message = firstError instanceof Error ? firstError.message : 'Unknown error'
      return c.json({ error: message }, 500)
    }

    // パースエラー → LLMに送り返してリトライ
    console.log('[suggest-form-fields] parse error, starting retry loop')
    let brokenText = extractRawText(firstError.message)

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[suggest-form-fields] retry attempt ${attempt}/${MAX_RETRIES}`)

        const repairMessages: LLMMessage[] = [
          { role: 'user', content: prompt },
          { role: 'assistant', content: brokenText },
          {
            role: 'user',
            content: `上記のレスポンスはJSONとして不正でした（途中で切れている、構文エラーなど）。
同じ内容を正しいJSON形式で再生成してください。label と intent は簡潔にし、出力が長くなりすぎないようにしてください。`,
          },
        ]

        const result = await infrastructure.llmProvider.chatStructured<FormFieldsResponse>(
          repairMessages,
          structuredOptions
        )

        console.log(
          `[suggest-form-fields] retry ${attempt} succeeded: ${result.data.formFields.length} fields`
        )
        return c.json({ formFields: result.data.formFields }, 200)
      } catch (retryError) {
        if (!(retryError instanceof LLMProviderError && retryError.type === 'SCHEMA_VALIDATION')) {
          console.error(`[suggest-form-fields] retry ${attempt} non-parse error:`, retryError)
          const message = retryError instanceof Error ? retryError.message : 'Unknown error'
          return c.json({ error: message }, 500)
        }

        console.log(`[suggest-form-fields] retry ${attempt} still parse error`)
        brokenText = extractRawText(retryError.message)
      }
    }

    console.error(`[suggest-form-fields] all ${MAX_RETRIES} retries exhausted`)
    return c.json({ error: 'フォーム項目の生成に失敗しました。もう一度お試しください。' }, 500)
  }
})

export default app
