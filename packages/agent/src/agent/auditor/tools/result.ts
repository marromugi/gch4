import { z } from 'zod'
import { createTool } from '../../../tools/types'

/**
 * Auditor result ツールの引数スキーマ
 */
export const auditorResultArgsSchema = z.object({
  passed: z.boolean().describe('監査通過フラグ'),
  issues: z.array(z.string()).optional().describe('問題点のリスト（不合格の場合）'),
  recommendations: z.array(z.string()).optional().describe('改善提案のリスト'),
  summary: z.string().describe('インタビューの要約'),
})

/**
 * Auditor result ツールの結果スキーマ
 */
export const auditorResultResultSchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  summary: z.string(),
  completed: z.literal(true),
})

/**
 * Auditor result ツール
 *
 * 最終監査の結果を返す。
 * このツールが呼ばれると Auditor エージェントは完了となり、
 * ワークフロー全体が完了する。
 */
export const auditorResultTool = createTool({
  name: 'audit_result',
  description: `最終監査の結果を返す。
- passed が true の場合、インタビューは正常に完了
- passed が false の場合、issues に問題点を含める
- summary にインタビューの要約を含める（記録用）`,
  args: auditorResultArgsSchema,
  result: auditorResultResultSchema,
  execute: async (args) => {
    return {
      passed: args.passed,
      issues: args.issues,
      recommendations: args.recommendations,
      summary: args.summary,
      completed: true as const,
    }
  },
})

export type AuditorResultArgs = z.infer<typeof auditorResultArgsSchema>
export type AuditorResultResult = z.infer<typeof auditorResultResultSchema>
