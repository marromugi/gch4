import { z } from 'zod'
import { createTool } from './types'

/**
 * subtask で起動可能なエージェント
 */
export const subtaskableAgents = ['reviewer', 'quick_check', 'auditor'] as const
export type SubtaskableAgent = (typeof subtaskableAgents)[number]

/**
 * subtask ツールの引数スキーマ
 */
export const subtaskArgsSchema = z.object({
  agent: z.enum(subtaskableAgents).describe('起動するサブエージェント'),
  context: z.string().optional().describe('サブエージェントに渡すコンテキスト情報'),
})

/**
 * subtask ツールの結果スキーマ
 */
export const subtaskResultSchema = z.object({
  started: z.literal(true),
  agent: z.enum(subtaskableAgents),
})

/**
 * subtask ツール: サブエージェントを起動する
 *
 * このツールが呼ばれた場合、Orchestrator はサブエージェントに遷移し、
 * サブエージェントの処理が完了するまで現在のエージェントは待機状態になる。
 *
 * サブエージェントの完了時（summarize, review, result ツール呼び出し時）、
 * 呼び出し元エージェントに制御が戻る。
 */
export const subtaskTool = createTool({
  name: 'subtask',
  description: `サブエージェントを起動する。
- reviewer: ユーザーの回答が十分かどうかをレビューする
- quick_check: 質問を送信する前にコンプライアンスチェックを行う
- auditor: 全フィールド完了後の最終監査を行う`,
  args: subtaskArgsSchema,
  result: subtaskResultSchema,
  execute: async (args) => {
    // 実際のサブエージェント起動は Orchestrator 側で処理
    // ここでは結果を返すのみ
    return {
      started: true as const,
      agent: args.agent,
    }
  },
})

export type SubtaskToolArgs = z.infer<typeof subtaskArgsSchema>
export type SubtaskToolResult = z.infer<typeof subtaskResultSchema>
