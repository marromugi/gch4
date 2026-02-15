import type { QuestionType } from '../../store/types'
import type { BaseAgentContext, AgentTurnResult } from '../types'

/**
 * レビュー対象のフィールド情報
 */
export interface ReviewField {
  /** フィールドID */
  fieldId: string
  /** フィールドラベル */
  label: string
  /** フィールドの意図 */
  intent: string
  /** 必須フィールドかどうか */
  required: boolean
  /** 必要なファクト定義 */
  requiredFacts?: string[]
  /** 質問タイプ（basic/abstract） */
  questionType?: QuestionType
  /** このフィールドに対するフォローアップ回数 */
  followUpCount?: number
}

/**
 * Reviewer エージェントのコンテキスト
 */
export interface ReviewerContext extends BaseAgentContext {
  type: 'reviewer'
  /** レビュー対象のフィールド */
  currentField: ReviewField
  /** ユーザーの回答 */
  collectedAnswer: string
  /** 回答から抽出されたファクト */
  extractedFacts?: string[]
}

/**
 * Review の結果
 */
export interface ReviewResult {
  /** レビュー通過フラグ */
  passed: boolean
  /** フォームフィールドに設定する値（passed=true の場合は必須） */
  fieldValue?: string
  /** フィードバック（不合格の場合） */
  feedback?: string
  /** 不足しているファクト */
  missingFacts?: string[]
  /** 抽出されたファクト */
  extractedFacts?: string[]
}

/**
 * Reviewer エージェントのターン結果
 */
export interface ReviewerTurnResult extends AgentTurnResult {
  /** レビュー結果 */
  reviewResult?: ReviewResult
}
