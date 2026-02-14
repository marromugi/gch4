import type { LLMMessage } from '../../provider'
import type { BaseAgentContext, AgentTurnResult } from '../types'

/**
 * 収集されたフィールドの情報
 */
export interface CollectedFieldInfo {
  fieldId: string
  label: string
  value: unknown
  extractedFacts?: string[]
}

/**
 * Auditor エージェントのコンテキスト
 */
export interface AuditorContext extends BaseAgentContext {
  type: 'auditor'
  /** プラン全体 */
  plan: unknown
  /** 収集された全フィールド */
  allCollectedFields: CollectedFieldInfo[]
  /** 完全な会話履歴 */
  fullConversationHistory: LLMMessage[]
  /** 禁止トピック一覧 */
  prohibitedTopics?: string[]
}

/**
 * Audit の結果
 */
export interface AuditResult {
  /** 監査通過フラグ */
  passed: boolean
  /** 問題点（不合格の場合） */
  issues?: string[]
  /** 改善提案 */
  recommendations?: string[]
  /** インタビューサマリー */
  summary: string
}

/**
 * Auditor エージェントのターン結果
 */
export interface AuditorTurnResult extends AgentTurnResult {
  /** 監査結果 */
  auditResult?: AuditResult
}
