import { z } from 'zod'
import { createTool } from '../../../tools/types'

/**
 * 選択肢のスキーマ
 */
export const optionSchema = z.object({
  id: z.string().describe('選択肢の識別子'),
  label: z.string().describe('選択肢の表示テキスト'),
})

/**
 * 質問のスキーマ
 */
export const questionSchema = z.object({
  id: z.string().describe('質問の識別子'),
  question: z.string().describe('質問文'),
  options: z.array(optionSchema).min(2).max(5).describe('選択肢（2〜5個）'),
  selectionType: z.enum(['radio', 'checkbox']).describe('radio: 単一選択, checkbox: 複数選択'),
})

/**
 * ask_with_options ツールの引数スキーマ
 */
export const askWithOptionsArgsSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1)
    .describe('質問のリスト。分岐が必要な場合は1問ずつ、独立した質問は複数まとめて投げる'),
})

/**
 * ask_with_options ツールの結果スキーマ
 */
export const askWithOptionsResultSchema = z.object({
  sent: z.literal(true),
  awaitingResponse: z.literal(true),
})

/**
 * ask_with_options ツール
 * ユーザーに選択肢付きの質問を投げる
 */
export const askWithOptionsTool = createTool({
  name: 'ask_with_options',
  description: `ユーザーに選択肢付きの質問を送る。

## 使い方
- 分岐が必要な質問（回答によって次の質問が変わる）: 1問ずつ送信
- 独立した質問（互いに影響しない）: 複数まとめて送信可能

## selectionType
- radio: 単一選択（1つだけ選ぶ）
- checkbox: 複数選択（複数選べる）

## 例
\`\`\`json
{
  "questions": [
    {
      "id": "respondent_type",
      "question": "このフォームは誰が回答しますか？",
      "options": [
        { "id": "internal", "label": "社内メンバー" },
        { "id": "external", "label": "外部の人" }
      ],
      "selectionType": "radio"
    }
  ]
}
\`\`\``,
  args: askWithOptionsArgsSchema,
  result: askWithOptionsResultSchema,
  execute: async (_args) => ({
    sent: true as const,
    awaitingResponse: true as const,
  }),
})

/**
 * 型エクスポート
 */
export type AskWithOptionsArgs = z.infer<typeof askWithOptionsArgsSchema>
export type Question = z.infer<typeof questionSchema>
export type Option = z.infer<typeof optionSchema>
