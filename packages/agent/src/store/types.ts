import type { QuestionType } from '../agent/architect/schemas'
import type { AgentType } from '../agent/types'
import type { LLMMessage as ProviderLLMMessage } from '../provider/types'

// Re-export LLMMessage for backward compatibility
export type LLMMessage = ProviderLLMMessage

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
  greeter: Record<string, never>
  architect: Record<string, never>
  interviewer: Record<string, never>
  quick_check: QuickCheckArgsType
  reviewer: ReviewerArgsType
  auditor: AuditorArgsType
}

/**
 * エージェントタイプから結果型へのマッピング
 */
export interface AgentResultMap {
  greeter: { language?: string; country?: string; timezone?: string }
  architect: { plan?: unknown }
  interviewer: Record<string, never>
  quick_check: QuickCheckResultType
  reviewer: ReviewerResultType
  auditor: AuditorResultType
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
  | {
      agentType: 'greeter'
      result: AgentResultMap['greeter']
      stackEntry: AgentStackEntry<'greeter'>
    }
  | {
      agentType: 'architect'
      result: AgentResultMap['architect']
      stackEntry: AgentStackEntry<'architect'>
    }
  | {
      agentType: 'interviewer'
      result: AgentResultMap['interviewer']
      stackEntry: AgentStackEntry<'interviewer'>
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
  jobFormFieldId: string
  /** Factのキー */
  factKey: string
  /** 収集すべき事実 */
  fact: string
  /** 完了条件 */
  doneCriteria: string
  /** 質問時のヒント */
  questioningHints: string | null
}

/**
 * フォーム情報
 */
export interface SessionForm {
  /** フォームフィールド一覧 */
  fields: FormField[]
  /** ファクト定義一覧 */
  facts: FactDefinition[]
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
    country?: string
    timezone?: string
  }

  /** フォーム情報 */
  form: SessionForm

  /** インタビュープラン */
  plan?: unknown

  /** 現在のフィールドインデックス */
  currentFieldIndex: number

  /** 収集済みフィールド値（fieldId -> value） */
  collectedFields: Record<string, string>

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

/**
 * サブセッションのステータス
 */
export type SubSessionStatus = 'active' | 'waiting_user' | 'completed'

/**
 * サブセッションの状態
 *
 * KV に保存されるサブセッションのデータ構造。
 * 独自のメッセージ履歴を持ち、完了時に result のみ親に返す。
 */
export interface SubSessionState {
  /** サブセッションを実行しているエージェント */
  agent: AgentType

  /** サブセッション開始時の引数 */
  args: Record<string, unknown>

  /** サブセッション内のメッセージ履歴（親には伝播しない、ツール結果を含む） */
  messages: SubSessionMessage[]

  /** ステータス */
  status: SubSessionStatus

  /** サブセッションの結果（完了時のみ） */
  result?: unknown

  /** 作成日時 */
  createdAt: number

  /** 更新日時 */
  updatedAt: number
}

/** TTL: 24時間（秒） */
export const SESSION_TTL = 24 * 60 * 60

/**
 * メインセッションを初期化
 */
export function createInitialMainSession(sessionId: string, form: SessionForm): MainSessionState {
  const now = Date.now()
  return {
    sessionId,
    agentStack: [],
    messages: [],
    subSessionResults: {},
    bootstrap: {},
    form,
    currentFieldIndex: 0,
    collectedFields: {},
    followUpCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * サブセッションを初期化
 */
export function createInitialSubSession(
  agent: AgentType,
  args: Record<string, unknown>
): SubSessionState {
  const now = Date.now()
  return {
    agent,
    args,
    messages: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
}
