import { z } from 'zod'
import { createTool } from './types'

/**
 * ask ツールの引数スキーマ
 */
export const askArgsSchema = z.object({
  message: z.string().describe('ユーザーに表示するメッセージ'),
})

/**
 * ask ツールの結果スキーマ
 */
export const askResultSchema = z.object({
  sent: z.literal(true),
  awaitingResponse: z.literal(true),
})

/**
 * ask ツール: ユーザーに質問を送る
 *
 * このツールが呼ばれた場合、エージェントのターンは終了し、
 * ユーザーの回答を待つ状態になる。
 */
export const askTool = createTool({
  name: 'ask',
  description:
    'ユーザーに質問やメッセージを送る。このツールを呼ぶとエージェントのターンは終了し、ユーザーの回答を待つ。',
  args: askArgsSchema,
  result: askResultSchema,
  execute: async (_args) => {
    // 実際のメッセージ送信は Orchestrator 側で処理
    // ここでは結果を返すのみ
    return {
      sent: true as const,
      awaitingResponse: true as const,
    }
  },
})

export type AskToolArgs = z.infer<typeof askArgsSchema>
export type AskToolResult = z.infer<typeof askResultSchema>
