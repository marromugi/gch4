import { z } from 'zod'
import type { AgentType } from '../agent/types'
import type { LLMMessage as ProviderLLMMessage } from '../provider/types'

// Re-export LLMMessage for backward compatibility
export type LLMMessage = ProviderLLMMessage

// ============================================
// QuestionType（元 architect/schemas.ts から移動）
// ============================================

/**
 * 質問タイプ
 * - basic: 考える余地がない基本情報（氏名、メール、電話番号など）
 * - abstract: 深掘りが必要な質問（志望動機、価値観など）
 */
export const QuestionTypeSchema = z.enum(['basic', 'abstract'])

export type QuestionType = z.infer<typeof QuestionTypeSchema>

// ============================================
// Branded Types
// ============================================

/** FieldId のブランドシンボル */
declare const fieldIdBrand: unique symbol

/**
 * フォームフィールドID（Branded Type）
 *
 * 生の string と区別するため、toFieldId() を通して生成する必要がある。
 * これにより、collectedFields への不正なキー追加をコンパイル時に検出できる。
 */
export type FieldId = string & { readonly [fieldIdBrand]: never }

/**
 * 文字列を FieldId に変換
 *
 * @param id - フィールドID文字列
 * @returns FieldId 型の値
 * @throws 空文字列の場合
 */
export function toFieldId(id: string): FieldId {
  if (!id || id.trim() === '') {
    throw new Error('Invalid fieldId: empty string')
  }
  return id as FieldId
}

/**
 * 収集されたフィールド値のマップ
 *
 * キーは FieldId 型に制限されているため、toFieldId() を通さない
 * 生の string をキーとして使用するとコンパイルエラーになる。
 */
export type CollectedFields = Record<FieldId, string>

/**
 * ツール実行結果メッセージ
 */
export interface ToolResultMessage {
  role: 'tool_result'
  toolName: string
  args: Record<string, unknown>
  result: unknown
}

/**
 * サブセッション用メッセージ（LLMMessage + ツール結果）
 */
export type SubSessionMessage = LLMMessage | ToolResultMessage

/**
 * メッセージがツール結果かどうかを判定
 */
export function isToolResultMessage(message: SubSessionMessage): message is ToolResultMessage {
  return message.role === 'tool_result'
}

// ============================================
// エージェント引数・結果の型マップ
// ============================================

/**
 * QuickCheck の引数型
 */
export interface QuickCheckArgsType {
  pendingQuestion: string
  fieldId: string
  intent: string
  prohibitedTopics?: string[]
  collectedFacts?: string[]
}

/**
 * QuickCheck の結果型
 */
export interface QuickCheckResultType {
  passed: boolean
  issues?: string[]
  suggestion?: string
}

/**
 * Reviewer の引数型
 */
export interface ReviewerArgsType {
  fieldId: string
  label: string
  intent: string
  required: boolean
  requiredFacts?: string[]
  userAnswer: string
  questionType?: QuestionType
  followUpCount?: number
}

/**
 * Reviewer の結果型
 */
export interface ReviewerResultType {
  passed: boolean
  fieldValue?: string
  feedback?: string
  missingFacts?: string[]
  extractedFacts?: string[]
}

/**
 * Auditor の引数型
 */
export interface AuditorArgsType {
  collectedFields: Array<{
    fieldId: string
    label: string
    value: unknown
  }>
  conversationLength: number
  prohibitedTopics?: string[]
}

/**
 * Auditor の結果型
 */
export interface AuditorResultType {
  passed: boolean
  issues?: string[]
  recommendations?: string[]
  summary: string
}

/**
 * エージェントタイプから引数型へのマッピング
 */
export interface AgentArgsMap {
  quick_check: QuickCheckArgsType
  reviewer: ReviewerArgsType
  auditor: AuditorArgsType
  form_designer: { purpose: string }
}

/**
 * エージェントタイプから結果型へのマッピング
 */
export interface AgentResultMap {
  quick_check: QuickCheckResultType
  reviewer: ReviewerResultType
  auditor: AuditorResultType
  form_designer: { fields: unknown[] }
}

/**
 * エージェントスタックのエントリ（ジェネリクス版）
 */
export interface AgentStackEntry<T extends AgentType = AgentType> {
  /** 呼び出し元エージェント */
  callerAgent: AgentType
  /** 呼び出されたエージェント */
  calledAgent: T
  /** サブセッション開始時の引数 */
  args: T extends keyof AgentArgsMap ? AgentArgsMap[T] : Record<string, unknown>
  /** サブセッションの結果キー */
  resultKey: string
}

// ============================================
// Discriminated Union 版（Control Flow Narrowing 対応）
// ============================================

/**
 * サブセッション完了時のペイロード（Discriminated Union）
 *
 * switch (payload.agentType) で型が自動的に絞り込まれる
 */
export type SubSessionCompletionPayload =
  | {
      agentType: 'quick_check'
      result: QuickCheckResultType
      stackEntry: AgentStackEntry<'quick_check'>
    }
  | {
      agentType: 'reviewer'
      result: ReviewerResultType
      stackEntry: AgentStackEntry<'reviewer'>
    }
  | {
      agentType: 'auditor'
      result: AuditorResultType
      stackEntry: AgentStackEntry<'auditor'>
    }

/**
 * フォームフィールド情報
 */
export interface FormField {
  /** フィールドID */
  id: string
  /** フィールド識別子 */
  fieldId: string
  /** 表示名 */
  label: string
  /** 深掘り観点 */
  intent: string | null
  /** 必須フラグ */
  required: boolean
  /** 表示順序 */
  sortOrder: number
}

/**
 * ファクト定義
 */
export interface FactDefinition {
  /** ID */
  id: string
  /** 紐づくFormFieldのID */
  formFieldId: string
  /** Factのキー */
  factKey: string
  /** 収集すべき事実 */
  fact: string
  /** 完了条件 */
  doneCriteria: string
  /** 質問時のヒント */
  questioningHints: string | null
  /** 聞いてはいけないこと */
  boundaries: string[] | null
}

/**
 * フォーム情報
 */
export interface SessionForm {
  /** フォームフィールド一覧 */
  fields: FormField[]
  /** ファクト定義一覧 */
  facts: FactDefinition[]
  /** 完了時メッセージ */
  completionMessage?: string | null
}

/**
 * QuickCheck の結果（メインセッションに保存）
 */
export interface QuickCheckResultState {
  /** 対象フィールドID */
  fieldId: string
  /** チェック通過フラグ */
  passed: boolean
  /** 承認済み質問文言（passed=true の場合） */
  approvedQuestion?: string
  /** 問題点（passed=false の場合） */
  issues?: string[]
  /** 修正提案（passed=false の場合） */
  suggestion?: string
}

/**
 * メインセッションの状態
 *
 * KV に保存されるメインセッションのデータ構造。
 * messages には ask の中身とユーザーメッセージのみを保持する。
 */
export interface MainSessionState {
  /** セッションID */
  sessionId: string

  /** エージェントスタック */
  agentStack: AgentStackEntry[]

  /**
   * メッセージ履歴
   * - assistant: ask ツールの中身のみ
   * - user: ユーザーメッセージ
   */
  messages: LLMMessage[]

  /** サブセッション結果のキャッシュ */
  subSessionResults: Record<string, unknown>

  /** ブートストラップ情報 */
  bootstrap: {
    language?: string
    /** 言語確認済みフラグ（ブラウザ言語から設定された場合に使用） */
    languageConfirmed?: boolean
    /** 言語入力待ちフラグ（「他の言語で話す」選択後に true） */
    waitingForLanguageInput?: boolean
  }

  /** フォーム情報 */
  form: SessionForm

  /** インタビュープラン */
  plan?: unknown

  /** 現在のフィールドインデックス */
  currentFieldIndex: number

  /** 収集済みフィールド値（fieldId -> value） */
  collectedFields: CollectedFields

  /** QuickCheck の結果（現在のフィールド用） */
  quickCheckResult?: QuickCheckResultState

  /** ユーザー回答待ちフラグ（ask 後に true、reviewer 完了後に false） */
  awaitingReview?: boolean

  /** Reviewer からのフィードバック（再質問時） */
  reviewerFeedback?: string

  /** 監査完了フラグ */
  auditCompleted?: boolean

  /** 現在のフィールドに対するフォローアップ回数 */
  followUpCount: number

  /** 作成日時 */
  createdAt: number

  /** 更新日時 */
  updatedAt: number
}
