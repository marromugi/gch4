import { z } from 'zod'
import { AuditorAgent } from './AuditorAgent'
import { AUDITOR_SYSTEM_PROMPT, buildAuditPrompt } from './prompts'
import type { AgentDefinition } from '../../registry/types'

/**
 * Auditor の引数スキーマ
 */
export const auditorArgsSchema = z.object({
  collectedFields: z
    .array(
      z.object({
        fieldId: z.string(),
        label: z.string(),
        value: z.unknown(),
      })
    )
    .describe('収集されたフィールド'),
  conversationLength: z.number().describe('会話のターン数'),
  prohibitedTopics: z.array(z.string()).optional().describe('禁止トピック'),
})

/**
 * Auditor の結果スキーマ
 * ツール名を audit_result に変更して競合解消
 */
export const auditorResultSchema = z.object({
  passed: z.boolean().describe('監査通過フラグ'),
  issues: z.array(z.string()).optional().describe('問題点のリスト'),
  recommendations: z.array(z.string()).optional().describe('改善提案のリスト'),
  summary: z.string().describe('インタビューの要約'),
})

export type AuditorArgs = z.infer<typeof auditorArgsSchema>
export type AuditorResult = z.infer<typeof auditorResultSchema>

/**
 * Auditor エージェント定義
 */
export const auditorDefinition: AgentDefinition<
  typeof auditorArgsSchema,
  typeof auditorResultSchema
> = {
  type: 'auditor',
  argsSchema: auditorArgsSchema,
  resultSchema: auditorResultSchema,

  buildSystemPrompt: (args) => {
    const contextPrompt = buildAuditPrompt({
      collectedFields: args.collectedFields,
      conversationLength: args.conversationLength,
      prohibitedTopics: args.prohibitedTopics,
    })

    return `${AUDITOR_SYSTEM_PROMPT}\n\n${contextPrompt}`
  },

  buildInitialMessage: (args) => ({
    role: 'user',
    content: `Please perform the final audit of this interview session.

Total fields collected: ${args.collectedFields.length}
Conversation turns: ${args.conversationLength}

Use the 'result' tool to return your verdict.`,
  }),

  createAgent: (deps) => new AuditorAgent(deps),
}
