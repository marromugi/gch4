import { z } from 'zod'
import type { LLMToolDefinition } from '../../../provider/types'

/**
 * 選択肢のスキーマ
 */
const optionSchema = z.object({
  id: z.string().describe('オプションの一意識別子'),
  label: z.string().describe('表示ラベル'),
})

/**
 * ask_options ツールの引数スキーマ
 */
export const askOptionsArgsSchema = z.object({
  message: z.string().describe('ユーザーに送信する質問メッセージ'),
  options: z.array(optionSchema).min(2).describe('選択肢の配列（最低2つ）'),
  selectionType: z
    .enum(['radio', 'checkbox'])
    .describe('選択タイプ: radio=単一選択, checkbox=複数選択'),
})

/**
 * ask_options ツールの引数型
 */
export type AskOptionsArgs = z.infer<typeof askOptionsArgsSchema>

/**
 * ask_options ツールの LLM 定義
 *
 * chatWithTools に渡すための定義
 */
export const askOptionsToolDefinition: LLMToolDefinition = {
  name: 'ask_options',
  description:
    'Send a question with selectable options to the user. Use this when you want the user to choose from predefined answers. After calling this tool, wait for the user to respond before taking any other action.',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The question message to send to the user',
      },
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the option',
            },
            label: {
              type: 'string',
              description: 'Display label for the option',
            },
          },
          required: ['id', 'label'],
        },
        minItems: 2,
        description: 'Array of selectable options (minimum 2)',
      },
      selectionType: {
        type: 'string',
        enum: ['radio', 'checkbox'],
        description: 'Selection type: radio for single selection, checkbox for multiple',
      },
    },
    required: ['message', 'options', 'selectionType'],
  },
}

/**
 * ask_options ツールの引数を検証
 */
export function validateAskOptionsArgs(args: unknown): AskOptionsArgs {
  return askOptionsArgsSchema.parse(args)
}
