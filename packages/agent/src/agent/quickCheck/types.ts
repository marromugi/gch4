import type { BaseAgentContext, AgentTurnResult } from '../types'

/**
 * チェック対象の質問情報
 */
export interface PendingQuestion {
  /** 質問テキスト */
  content: string
  /** 対象フィールドID */
  fieldId: string
  /** フィールドの意図 */
  intent: string
}

/**
 * QuickCheck エージェントのコンテキスト
 */
export interface QuickCheckContext extends BaseAgentContext {
  type: 'quick_check'
  /** チェック対象の質問 */
  pendingQuestion: PendingQuestion
  /** 禁止トピック一覧 */
  prohibitedTopics?: string[]
  /** 既に収集済みのファクト */
  collectedFacts?: string[]
}

/**
 * QuickCheck の結果
 */
export interface QuickCheckResult {
  /** チェック通過フラグ */
  passed: boolean
  /** 問題点（不合格の場合） */
  issues?: string[]
  /** 修正提案（不合格の場合） */
  suggestion?: string
}

/**
 * QuickCheck エージェントのターン結果
 */
export interface QuickCheckTurnResult extends AgentTurnResult {
  /** チェック結果 */
  checkResult?: QuickCheckResult
}
