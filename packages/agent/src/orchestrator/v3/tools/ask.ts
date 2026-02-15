import { z } from 'zod'
import type { LLMToolDefinition } from '../../../provider/types'

/**
 * ask ツールの引数スキーマ
 */
export const askArgsSchema = z.object({
  message: z.string().describe('ユーザーに送信するメッセージ'),
})

/**
 * ask ツールの引数型
 */
export type AskArgs = z.infer<typeof askArgsSchema>

/**
 * ask ツールの LLM 定義
 *
 * chatWithTools に渡すための定義
 */
export const askToolDefinition: LLMToolDefinition = {
  name: 'ask',
  description:
    'Send a message or question to the user. After calling this tool, wait for the user to respond before taking any other action.',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The message to send to the user',
      },
    },
    required: ['message'],
  },
}

/**
 * ask ツールの引数を検証
 */
export function validateAskArgs(args: unknown): AskArgs {
  return askArgsSchema.parse(args)
}
