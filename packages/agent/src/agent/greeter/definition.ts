import { z } from 'zod'
import { GreeterAgent } from './GreeterAgent'
import { GREETER_SYSTEM_PROMPT } from './prompts'
import type { AgentDefinition } from '../../registry/types'

/**
 * Greeter の引数スキーマ
 * 引数なし
 */
export const greeterArgsSchema = z.object({})

/**
 * Greeter の結果スキーマ
 */
export const greeterResultSchema = z.object({
  language: z.string().describe('設定された言語コード'),
  country: z.string().describe('設定された国コード'),
  timezone: z.string().describe('設定されたタイムゾーン'),
})

export type GreeterArgs = z.infer<typeof greeterArgsSchema>
export type GreeterResult = z.infer<typeof greeterResultSchema>

/**
 * Greeter エージェント定義
 */
export const greeterDefinition: AgentDefinition<
  typeof greeterArgsSchema,
  typeof greeterResultSchema
> = {
  type: 'greeter',
  argsSchema: greeterArgsSchema,
  resultSchema: greeterResultSchema,

  buildSystemPrompt: () => GREETER_SYSTEM_PROMPT,

  buildInitialMessage: () => ({
    role: 'user',
    content: 'Please greet the user and ask about their preferred language.',
  }),

  createAgent: (deps) => new GreeterAgent(deps),

  isSubtaskable: false,
}
