import { z } from 'zod'
import { createTool } from '../../../tools/types'

/**
 * review ツールの引数スキーマ
 */
export const reviewArgsSchema = z.object({
  passed: z.boolean().describe('レビュー通過フラグ'),
  fieldValue: z
    .string()
    .optional()
    .describe(
      'フォームフィールドに設定する値。passed=true の場合は必須。' +
        'ユーザーの回答から抽出した、フィールドに適した形式の値を設定する。' +
        '例: 「私の名前は山田太郎です」→「山田太郎」'
    ),
  feedback: z.string().optional().describe('ユーザーへのフィードバック（不合格の場合は必須）'),
  missingFacts: z.array(z.string()).optional().describe('不足しているファクトのリスト'),
  extractedFacts: z.array(z.string()).optional().describe('回答から抽出されたファクトのリスト'),
})

/**
 * review ツールの結果スキーマ
 */
export const reviewResultSchema = z.object({
  passed: z.boolean(),
  fieldValue: z.string().optional(),
  feedback: z.string().optional(),
  missingFacts: z.array(z.string()).optional(),
  extractedFacts: z.array(z.string()).optional(),
  completed: z.literal(true),
})

/**
 * review ツール
 *
 * ユーザーの回答をレビューし、結果を返す。
 * このツールが呼ばれると Reviewer エージェントは完了となり、
 * 呼び出し元エージェントに制御が戻る。
 */
export const reviewTool = createTool({
  name: 'review',
  description: `ユーザーの回答をレビューした結果を返す。
- passed が true の場合、回答は十分で次のフィールドに進む
- passed が false の場合、feedback に追加質問の内容を含め、再度質問する`,
  args: reviewArgsSchema,
  result: reviewResultSchema,
  execute: async (args) => {
    return {
      passed: args.passed,
      fieldValue: args.fieldValue,
      feedback: args.feedback,
      missingFacts: args.missingFacts,
      extractedFacts: args.extractedFacts,
      completed: true as const,
    }
  },
})

export type ReviewArgs = z.infer<typeof reviewArgsSchema>
export type ReviewToolResult = z.infer<typeof reviewResultSchema>
