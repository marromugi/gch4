import type { AgentType } from '../agent/types'

/**
 * ツール呼び出しログの入力型
 * Event Sourcing で状態を再構築するために使用
 */
export interface ToolCallLogInput {
  sequence: number
  agent: AgentType
  toolName: string
  args: Record<string, unknown>
  result: unknown
}

/**
 * エージェントスタックのエントリ (Legacy)
 * store/types.ts の AgentStackEntry と異なる構造
 */
export interface AgentStackEntry {
  /** 呼び出し元エージェント */
  callerAgent: AgentType
  /** 呼び出されたエージェント */
  calledAgent: AgentType
  /** サブセッション開始時のフィールドインデックス */
  fieldIndex: number
  /** サブエージェントに渡すコンテキスト（質問文など） */
  context?: string
}

/**
 * ワークフローの状態
 * 各エージェントが設定した値を保持
 */
export interface State {
  /** 言語（Greeter で設定） */
  language?: string
  /** 居住国（Greeter で設定） */
  country?: string
  /** タイムゾーン（Greeter で設定） */
  timezone?: string
  /** インタビュープラン（Architect で設定） */
  plan?: unknown
  /** 各フィールドの回答（Interviewer/Explorer で設定） */
  fields?: Record<string, unknown>
  /** 現在処理中のフィールドID */
  currentFieldId?: string
  /** 現在のフィールドインデックス */
  currentFieldIndex?: number
}

/**
 * ツールログから導出された状態
 * Event Sourcing パターンで使用
 */
export interface DerivedState {
  /** エージェントスタック（サブセッション追跡） */
  agentStack: AgentStackEntry[]
  /** 現在のフィールドインデックス */
  currentFieldIndex: number
  /** 導出された現在のエージェント */
  currentAgent: AgentType
  /** QuickCheck 通過フラグ（ask 前に必要） */
  quickCheckPassed?: boolean
  /** 最後の ask の内容（再開時に使用） */
  lastAskContent?: string
  /** 最後の subtask の context（サブエージェントに渡されたコンテキスト） */
  lastSubtaskContext?: string
}
