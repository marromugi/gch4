import { z } from 'zod'
import { FormDesignerAgent } from './FormDesignerAgent'
import { FORM_DESIGNER_SYSTEM_PROMPT, buildInitialMessage } from './prompts'
import { generatedFieldSchema } from './tools/generateFields'
import type { AgentDefinition } from '../../registry/types'

/**
 * FormDesigner の引数スキーマ
 */
export const formDesignerArgsSchema = z.object({
  purpose: z.string().describe('フォームの目的'),
})

/**
 * FormDesigner の結果スキーマ
 */
export const formDesignerResultSchema = z.object({
  fields: z.array(generatedFieldSchema).describe('生成されたフォームフィールド'),
})

export type FormDesignerArgs = z.infer<typeof formDesignerArgsSchema>
export type FormDesignerResult = z.infer<typeof formDesignerResultSchema>

/**
 * FormDesigner エージェント定義
 */
export const formDesignerDefinition: AgentDefinition<
  typeof formDesignerArgsSchema,
  typeof formDesignerResultSchema
> = {
  type: 'form_designer',
  argsSchema: formDesignerArgsSchema,
  resultSchema: formDesignerResultSchema,

  buildSystemPrompt: () => FORM_DESIGNER_SYSTEM_PROMPT,

  buildInitialMessage: (args) => ({
    role: 'user',
    content: buildInitialMessage(args.purpose),
  }),

  createAgent: (deps) => new FormDesignerAgent(deps),

  isSubtaskable: false,
}
