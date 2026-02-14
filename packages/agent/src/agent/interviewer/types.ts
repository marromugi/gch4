import type { DerivedState } from '../../orchestrator/types'
import type { Plan, PlanField } from '../architect/schemas'
import type { BaseAgentContext, AgentTurnResult } from '../types'

// Re-export for backwards compatibility
export type { Plan, PlanField }

/**
 * Interviewer のステージ
 *
 * 各ステージで「今何をすべきか」が明確に定義される。
 */
export type InterviewerStage =
  /** 質問を生成して quick_check へ送る */
  | 'GENERATE_QUESTION'
  /** quick_check 通過 → ask を呼ぶ */
  | 'QUICK_CHECK_PASSED'
  /** quick_check 失敗 → 質問を修正して再度 quick_check */
  | 'QUICK_CHECK_FAILED'
  /** ユーザー回答済み → reviewer を呼ぶ */
  | 'AWAITING_REVIEW'
  /** review 失敗 → フォローアップ質問を生成して quick_check へ */
  | 'REVIEW_FAILED'
  /** 全フィールド完了 → auditor を呼ぶ */
  | 'ALL_FIELDS_COMPLETED'
  /** 監査完了 → インタビュー終了 */
  | 'AUDIT_COMPLETED'

/**
 * QuickCheck のフィードバック（不合格の場合）
 */
export interface QuickCheckFeedback {
  /** 問題点 */
  issues?: string[]
  /** 修正提案 */
  suggestion?: string
}

/**
 * Interviewer エージェントのコンテキスト
 */
export interface InterviewerContext extends BaseAgentContext {
  type: 'interviewer'
  /** 現在のステージ（明示的に何をすべきかを示す） */
  stage: InterviewerStage
  /** インタビュープラン */
  plan: Plan
  /** 現在のフィールドインデックス */
  fieldIndex: number
  /** 収集済みフィールド */
  collectedFields: Record<string, unknown>
  /** QuickCheck 通過フラグ（ask 前に必要） */
  quickCheckPassed?: boolean
  /** 承認済み質問文言（quickCheckPassed=true の場合） */
  approvedQuestion?: string
  /** QuickCheck のフィードバック（不合格の場合） */
  quickCheckFeedback?: QuickCheckFeedback
  /** 導出された状態（サブセッション復元用） */
  derivedState?: DerivedState
  /** Reviewer からのフィードバック（再質問時） */
  reviewerFeedback?: string
}

/**
 * コンテキストからステージを導出
 */
export function deriveInterviewerStage(params: {
  plan: Plan
  fieldIndex: number
  quickCheckPassed?: boolean
  quickCheckFeedback?: QuickCheckFeedback
  reviewerFeedback?: string
  hasUserResponse?: boolean
  auditCompleted?: boolean
}): InterviewerStage {
  // 監査完了
  if (params.auditCompleted) {
    return 'AUDIT_COMPLETED'
  }

  const currentField = params.plan.fields[params.fieldIndex]

  // 全フィールド完了
  if (!currentField) {
    return 'ALL_FIELDS_COMPLETED'
  }

  // Reviewer からフィードバックがある場合 → フォローアップ質問を生成
  if (params.reviewerFeedback) {
    return 'REVIEW_FAILED'
  }

  // ユーザーからの回答がある場合 → reviewer を呼ぶ
  if (params.hasUserResponse) {
    return 'AWAITING_REVIEW'
  }

  // QuickCheck 通過済み → ask を呼ぶ
  if (params.quickCheckPassed) {
    return 'QUICK_CHECK_PASSED'
  }

  // QuickCheck 失敗 → 質問を修正
  if (params.quickCheckFeedback) {
    return 'QUICK_CHECK_FAILED'
  }

  // 質問タイプに関係なく GENERATE_QUESTION
  return 'GENERATE_QUESTION'
}

/**
 * Interviewer エージェントのターン結果
 */
export interface InterviewerTurnResult extends AgentTurnResult {
  /** 現在のフィールドインデックス */
  currentFieldIndex: number
  /** サブエージェントを起動した場合 */
  startedSubtask?: {
    agent: 'reviewer' | 'quick_check' | 'auditor'
    context?: string
  }
}
