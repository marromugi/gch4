import type { AgentType, ToolCallResult } from '../agent/types'
import type { TokenUsage } from '../provider'

/**
 * OrchestratorV2 の処理結果
 */
export interface ProcessResultV2 {
  /** ユーザーに表示するレスポンステキスト */
  responseText: string

  /** ワークフロー全体が完了したか */
  isComplete: boolean

  /** ユーザーの回答待ち状態か */
  awaitingUserResponse: boolean

  /** 実行されたツール呼び出し */
  toolCalls: ToolCallResult[]

  /** 現在のエージェント */
  currentAgent: AgentType

  /** トークン使用量 */
  usage?: TokenUsage
}

/**
 * OrchestratorV2 の依存関係
 */
export interface OrchestratorV2Config {
  /** 最大スタック深度（無限ループ防止） */
  maxStackDepth?: number

  /** デバッグモード */
  debug?: boolean
}

/**
 * サブセッション開始時の情報
 */
export interface SubSessionStartInfo {
  /** 呼び出されるエージェント */
  agent: AgentType

  /** エージェントに渡す引数 */
  args: Record<string, unknown>

  /** コンテキスト情報（オプション） */
  context?: string
}

/**
 * サブセッション完了時の情報
 */
export interface SubSessionCompleteInfo {
  /** 完了したエージェント */
  agent: AgentType

  /** 結果 */
  result: unknown

  /** 完了ツール名 */
  completeToolName: string
}

/**
 * セッション状態の変更イベント
 */
export type SessionEventType =
  | 'SESSION_STARTED'
  | 'MESSAGE_RECEIVED'
  | 'AGENT_STARTED'
  | 'AGENT_COMPLETED'
  | 'SUBSESSION_STARTED'
  | 'SUBSESSION_COMPLETED'
  | 'ASK_SENT'
  | 'WORKFLOW_COMPLETED'
  | 'ERROR'

export interface SessionEvent {
  type: SessionEventType
  timestamp: number
  data?: unknown
}
