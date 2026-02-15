import type { AuditorArgs, AuditorResult } from '../agent/auditor/definition'
import type { QuickCheckArgs, QuickCheckResult } from '../agent/quickCheck/definition'
import type { ReviewerArgs, ReviewerResult } from '../agent/reviewer/definition'
import type { ITypedAgent } from '../agent/typed/types'
import type { AgentType, IAgent } from '../agent/types'
import type { ILogger } from '../logger'
import type { ILLMProvider } from '../provider'
import type { LLMMessage, MainSessionState } from '../store/types'
import type { z } from 'zod'

// 各エージェントの型をインポート（循環参照を避けるため、型のみインポート）

/**
 * エージェント種別と型の対応マップ
 *
 * AgentType をキーにして、各エージェントの Args, Result, Agent 型を取得できる。
 * これにより createTypedAgent の戻り値型を正確に推論可能。
 */
export interface AgentTypeMap {
  quick_check: {
    args: QuickCheckArgs
    result: QuickCheckResult
    agent: ITypedAgent<QuickCheckArgs, QuickCheckResult>
  }
  reviewer: {
    args: ReviewerArgs
    result: ReviewerResult
    agent: ITypedAgent<ReviewerArgs, ReviewerResult>
  }
  auditor: {
    args: AuditorArgs
    result: AuditorResult
    agent: ITypedAgent<AuditorArgs, AuditorResult>
  }
}

/**
 * 型付きエージェントをサポートするエージェント種別
 */
export type TypedAgentType = keyof AgentTypeMap

/**
 * エージェント状態（buildSystemPrompt / buildInitialMessage に渡す）
 */
export interface AgentState {
  /** 言語コード */
  language?: string
  /** インタビュープラン */
  plan?: unknown
  /** 現在のフィールドインデックス */
  currentFieldIndex?: number
  /** 収集済みフィールド */
  collectedFields?: Record<string, unknown>
  /** QuickCheck 通過フラグ */
  quickCheckPassed?: boolean
  /** QuickCheck のフィードバック（不合格の場合） */
  quickCheckFeedback?: {
    issues?: string[]
    suggestion?: string
  }
  /** Reviewer からのフィードバック（再質問時） */
  reviewerFeedback?: string
  /** ユーザー回答待ちフラグ */
  awaitingReview?: boolean
  /** 最後のサブセッション結果 */
  lastSubSessionResult?: unknown
}

/**
 * エージェントファクトリの依存関係
 */
export interface AgentFactoryDeps {
  provider: ILLMProvider
  logger?: ILogger
}

/**
 * エージェント定義
 *
 * 各エージェントの argsSchema, resultSchema を定義する。
 * AgentRegistry に登録して一元管理する。
 */
export interface AgentDefinition<
  TArgsSchema extends z.ZodType = z.ZodType,
  TResultSchema extends z.ZodType = z.ZodType,
> {
  /** エージェント種別 */
  type: AgentType

  /**
   * 引数スキーマ
   * サブセッション開始時の args をバリデーションする。
   */
  argsSchema: TArgsSchema

  /**
   * 結果スキーマ
   * completion.context をバリデーションする。
   */
  resultSchema: TResultSchema

  /**
   * システムプロンプトを構築
   * @param args サブセッション開始時の引数
   * @param state エージェント状態
   */
  buildSystemPrompt: (args: z.infer<TArgsSchema>, state: AgentState) => string

  /**
   * 初期メッセージを構築
   * サブセッション開始時の最初の user メッセージを生成する。
   * null を返すと初期メッセージなしで開始する。
   */
  buildInitialMessage: (args: z.infer<TArgsSchema>) => LLMMessage | null

  /**
   * エージェントファクトリ
   */
  createAgent: (deps: AgentFactoryDeps) => IAgent

  /**
   * サブエージェントとして呼び出し可能か（V2専用、オプショナル）
   * @deprecated V3では使用されない
   */
  isSubtaskable?: boolean

  /**
   * サブセッション開始時に引数を初期化（V2専用、オプショナル）
   * @deprecated V3では使用されない
   */
  initArgs?: (mainSession: MainSessionState, context?: string) => z.infer<TArgsSchema>
}
