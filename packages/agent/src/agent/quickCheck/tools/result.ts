import { z } from 'zod'
import { createTool } from '../../../tools/types'

/**
 * QuickCheck result ツールの引数スキーマ
 */
export const quickCheckResultArgsSchema = z.object({
  passed: z.boolean().describe('チェック通過フラグ'),
  issues: z.array(z.string()).optional().describe('問題点（不合格の場合）'),
  suggestion: z.string().optional().describe('修正提案（不合格の場合）'),
})

/**
 * QuickCheck result ツールの結果スキーマ
 */
export const quickCheckResultResultSchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.string()).optional(),
  suggestion: z.string().optional(),
  completed: z.literal(true),
})

/**
 * QuickCheck result ツール
 *
 * コンプライアンスチェックの結果を返す。
 * このツールが呼ばれると QuickCheck エージェントは完了となり、
 * 呼び出し元エージェントに制御が戻る。
 */
export const quickCheckResultTool = createTool({
  name: 'result',
  description: `コンプライアンスチェックの結果を返す。
- passed が true の場合、質問は送信可能
- passed が false の場合、issues に問題点、suggestion に修正提案を含める`,
  args: quickCheckResultArgsSchema,
  result: quickCheckResultResultSchema,
  execute: async (args) => {
    return {
      passed: args.passed,
      issues: args.issues,
      suggestion: args.suggestion,
      completed: true as const,
    }
  },
})

export type QuickCheckResultArgs = z.infer<typeof quickCheckResultArgsSchema>
export type QuickCheckResultResult = z.infer<typeof quickCheckResultResultSchema>
