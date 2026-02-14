import { z } from 'zod'
import { ArchitectAgent } from './ArchitectAgent'
import { ARCHITECT_SYSTEM_PROMPT } from './prompts'
import { PlanSchema } from './schemas'
import type { AgentDefinition, AgentState } from '../../registry/types'

/**
 * Architect の引数スキーマ
 * 引数なし（フィールド定義は state から取得）
 */
export const architectArgsSchema = z.object({})

/**
 * Architect の結果スキーマ
 */
export const architectResultSchema = z.object({
  plan: PlanSchema,
})

export type ArchitectArgs = z.infer<typeof architectArgsSchema>
export type ArchitectResult = z.infer<typeof architectResultSchema>

/**
 * フィールド定義からコンテキストを構築
 */
function buildFieldContext(state: AgentState): string {
  // state から fieldDefinitions を取得（Orchestrator が設定）
  const fieldDefinitions = (state as { fieldDefinitions?: unknown[] }).fieldDefinitions
  if (!fieldDefinitions || fieldDefinitions.length === 0) {
    return 'No field definitions provided.'
  }

  const fieldList = fieldDefinitions
    .map((field, index) => {
      const f = field as {
        id: string
        label: string
        intent: string
        required: boolean
      }
      return `${index + 1}. ${f.label} (ID: ${f.id})
   - Intent: ${f.intent}
   - Required: ${f.required ? 'Yes' : 'No'}`
    })
    .join('\n\n')

  return `## フィールド定義\n\n${fieldList}`
}

/**
 * Architect エージェント定義
 */
export const architectDefinition: AgentDefinition<
  typeof architectArgsSchema,
  typeof architectResultSchema
> = {
  type: 'architect',
  argsSchema: architectArgsSchema,
  resultSchema: architectResultSchema,

  buildSystemPrompt: (_, state) => {
    const fieldContext = buildFieldContext(state)
    return `${ARCHITECT_SYSTEM_PROMPT}\n\n${fieldContext}`
  },

  buildInitialMessage: () => ({
    role: 'user',
    content:
      'Please analyze the field definitions and create an interview plan using the create_plan tool.',
  }),

  createAgent: (deps) => new ArchitectAgent(deps),

  isSubtaskable: false,
}
