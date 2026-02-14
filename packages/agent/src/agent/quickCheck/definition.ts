import { z } from 'zod'
import { QUICK_CHECK_SYSTEM_PROMPT, buildQuickCheckPrompt } from './prompts'
import { QuickCheckAgent } from './QuickCheckAgent'
import type { AgentDefinition } from '../../registry/types'
import type { Plan } from '../architect/schemas'

/**
 * QuickCheck の引数スキーマ
 */
export const quickCheckArgsSchema = z.object({
  pendingQuestion: z.string().describe('チェック対象の質問'),
  fieldId: z.string().describe('対象フィールドID'),
  intent: z.string().describe('フィールドの意図'),
  prohibitedTopics: z.array(z.string()).optional().describe('禁止トピック'),
  collectedFacts: z.array(z.string()).optional().describe('既に収集済みのファクト'),
})

/**
 * QuickCheck の結果スキーマ
 * ツール名を quick_check_result に変更して競合解消
 */
export const quickCheckResultSchema = z.object({
  passed: z.boolean().describe('チェック通過フラグ'),
  issues: z.array(z.string()).optional().describe('問題点（不合格の場合）'),
  suggestion: z.string().optional().describe('修正提案（不合格の場合）'),
})

export type QuickCheckArgs = z.infer<typeof quickCheckArgsSchema>
export type QuickCheckResult = z.infer<typeof quickCheckResultSchema>

/**
 * QuickCheck エージェント定義
 */
export const quickCheckDefinition: AgentDefinition<
  typeof quickCheckArgsSchema,
  typeof quickCheckResultSchema
> = {
  type: 'quick_check',
  argsSchema: quickCheckArgsSchema,
  resultSchema: quickCheckResultSchema,

  buildSystemPrompt: (args) => {
    const contextPrompt = buildQuickCheckPrompt({
      pendingQuestion: args.pendingQuestion,
      fieldId: args.fieldId,
      intent: args.intent,
      prohibitedTopics: args.prohibitedTopics,
      collectedFacts: args.collectedFacts,
    })

    return `${QUICK_CHECK_SYSTEM_PROMPT}\n\n${contextPrompt}`
  },

  buildInitialMessage: (args) => ({
    role: 'user',
    content: `Please check if the following question is compliant:
"${args.pendingQuestion}"

Use the 'result' tool to return your verdict.`,
  }),

  createAgent: (deps) => new QuickCheckAgent(deps),

  isSubtaskable: true,

  initArgs: (mainSession, context) => {
    const plan = mainSession.plan as Plan | undefined
    const field = plan?.fields[mainSession.currentFieldIndex]

    if (!field) {
      throw new Error('Cannot start quick_check without current field')
    }

    return {
      pendingQuestion: context ?? '',
      fieldId: field.fieldId,
      intent: field.intent,
      prohibitedTopics: plan?.prohibitedTopics,
    }
  },
}
