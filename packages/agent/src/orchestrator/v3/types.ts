import type { LLMMessage, TokenUsage } from '../../provider/types'
import type {
  CollectedFields,
  MainSessionState,
  QuestionType,
  SessionForm,
} from '../../store/types'

/**
 * Plan のフィールド定義
 */
export interface PlanField {
  /** フィールドID */
  fieldId: string
  /** 表示名 */
  label: string
  /** 質問意図 */
  intent: string
  /** 必須フラグ */
  required: boolean
  /** 質問タイプ */
  questionType: QuestionType
  /** 質問タイプの理由 */
  questionTypeReason?: string
  /** 収集すべきファクト */
  requiredFacts: string[]
  /** 表示順序（オプション） */
  sortOrder?: number
  /** 聞いてはいけないこと（オプション） */
  boundaries?: string[]
  /** 提案される質問文（オプション） */
  suggestedQuestion?: string
}

/**
 * インタビュープラン
 */
export interface Plan {
  /** プランに含まれるフィールド一覧 */
  fields: PlanField[]
  /** プランの概要 */
  summary?: string
  /** 禁止トピック（オプション） */
  prohibitedTopics?: string[]
}

/**
 * OrchestratorV3 のステージ
 */
export type OrchestratorStage =
  | 'BOOTSTRAP' // 言語収集
  | 'INTERVIEW_LOOP' // インタビュー中
  | 'FINAL_AUDIT' // 最終監査
  | 'COMPLETED' // 完了

/**
 * QuickCheck の結果（OrchestratorV3 用）
 */
export interface QuickCheckFeedback {
  passed: boolean
  issues?: string[]
  suggestion?: string
}

/**
 * Reviewer の結果（OrchestratorV3 用）
 */
export interface ReviewerFeedback {
  passed: boolean
  fieldValue?: string
  feedback?: string
  missingFacts?: string[]
  extractedFacts?: string[]
}

/**
 * Auditor の結果（OrchestratorV3 用）
 */
export interface AuditorFeedback {
  passed: boolean
  issues?: string[]
  recommendations?: string[]
  summary: string
}

/**
 * OrchestratorV3 のセッション状態
 *
 * MainSessionState を拡張し、V3 固有の状態を追加
 */
export interface OrchestratorV3SessionState extends MainSessionState {
  /** 現在のステージ */
  stage: OrchestratorStage

  /** 直前の QuickCheck 結果（あれば） */
  lastQuickCheckResult?: QuickCheckFeedback

  /** 直前の Reviewer 結果（あれば） */
  lastReviewerResult?: ReviewerFeedback

  /** 直前の Auditor 結果（あれば） */
  lastAuditorResult?: AuditorFeedback

  /** 保留中の質問（QuickCheck 待ち） */
  pendingQuestion?: string

  /** Orchestrator の会話履歴（LLM に送る用） */
  orchestratorMessages: LLMMessage[]
}

/**
 * ask_options ツールで使用する選択肢データ
 */
export interface AskOptionsData {
  /** 選択肢の配列 */
  options: Array<{ id: string; label: string }>
  /** 選択タイプ: radio=単一選択, checkbox=複数選択 */
  selectionType: 'radio' | 'checkbox'
}

/**
 * OrchestratorV3 の処理結果
 */
export interface ProcessResultV3 {
  /** ユーザーに表示するテキスト */
  responseText: string

  /** インタビュー完了フラグ */
  isComplete: boolean

  /** ユーザーの回答待ちフラグ */
  awaitingUserResponse: boolean

  /** 現在のステージ */
  currentStage: OrchestratorStage

  /** トークン使用量 */
  usage?: TokenUsage

  /** 収集されたフィールド値（COMPLETED 時のみ） */
  collectedFields?: CollectedFields

  /** 選択肢がある場合のデータ */
  askOptions?: AskOptionsData
}

/**
 * OrchestratorV3 の依存関係
 */
export interface OrchestratorV3Deps {
  kvStore: IKVStore
  registry: AgentRegistry
  provider: ILLMProvider
  logger?: ILogger
  config?: OrchestratorV3Config
}

/**
 * OrchestratorV3 の設定
 */
export interface OrchestratorV3Config {
  /** 最大 QuickCheck リトライ回数 */
  maxQuickCheckRetries?: number
  /** 最大フォローアップ回数 */
  maxFollowUpCount?: number
  /** デバッグモード */
  debug?: boolean
}

/**
 * KV ストアインターフェース（依存性注入用）
 */
export interface IKVStore {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
}

/**
 * Agent Registry インターフェース（依存性注入用）
 */
export interface AgentRegistry {
  getOrThrow<T>(type: string): T
}

/**
 * LLM Provider インターフェース（依存性注入用）
 */
export interface ILLMProvider {
  chatWithTools(
    messages: LLMMessage[],
    tools: LLMToolDefinition[],
    options?: GenerateOptions
  ): Promise<LLMToolCallResponse>
}

/**
 * Logger インターフェース（依存性注入用）
 */
export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
  debug(message: string, context?: Record<string, unknown>): void
}

// Re-export for convenience
export type { LLMMessage, TokenUsage } from '../../provider/types'
export type { SessionForm } from '../../store/types'

// Tool types (for chatWithTools)
interface LLMToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

interface GenerateOptions {
  model?: string
  temperature?: number
  maxOutputTokens?: number
  systemPrompt?: string
  forceToolCall?: boolean
}

interface LLMToolCallResponse {
  text: string | null
  toolCalls: Array<{
    name: string
    args: Record<string, unknown>
  }>
  usage?: TokenUsage
}

/**
 * 初期セッション状態を作成
 */
export function createInitialV3Session(
  sessionId: string,
  form: SessionForm
): OrchestratorV3SessionState {
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
    // V3 固有
    stage: 'BOOTSTRAP',
    orchestratorMessages: [],
  }
}

/** セッション TTL: 24時間（秒） */
export const V3_SESSION_TTL = 24 * 60 * 60
