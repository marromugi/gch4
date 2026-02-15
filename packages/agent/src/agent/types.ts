import type { LLMMessage, TokenUsage } from '../provider'
import type { Tool } from '../tools'

/**
 * エージェント種別
 */
export type AgentType = 'reviewer' | 'quick_check' | 'auditor' | 'form_designer'

/**
 * エージェント設定
 */
export interface AgentConfig {
  /** エージェント種別 */
  type: AgentType
  /** システムプロンプト */
  systemPrompt: string
  /** LLM の temperature */
  temperature?: number
  /** 最大出力トークン数 */
  maxOutputTokens?: number
  /** 使用するモデル */
  model?: string
  /** ツール呼び出しを強制する */
  forceToolCall?: boolean
}

/**
 * ツール呼び出し結果
 */
export interface ToolCallResult {
  /** ツール名 */
  toolName: string
  /** 引数 */
  args: Record<string, unknown>
  /** 実行結果 */
  result?: unknown
}

/**
 * エージェント完了時の結果
 * completion フィールドがあれば完了、なければ継続
 */
export interface AgentCompletion<T = unknown> {
  /** 完了時のコンテキスト（次のエージェントに渡すデータ） */
  context: T
}

/**
 * エージェント1ターンの結果
 */
export interface AgentTurnResult {
  /** レスポンステキスト */
  responseText: string
  /** ツール呼び出し */
  toolCalls?: ToolCallResult[]
  /** 完了時の結果（あれば完了、なければ継続） */
  completion?: AgentCompletion
  /** ユーザーの回答を待っているか */
  awaitingUserResponse?: boolean
  /** トークン使用量 */
  usage?: TokenUsage
}

/**
 * エージェントのベースコンテキスト
 */
export interface BaseAgentContext {
  /** エージェント種別 */
  type: AgentType
  /** セッションID */
  sessionId: string
  /** 会話履歴 */
  chatHistory: LLMMessage[]
  /** 言語設定（オプション） */
  state?: { language?: string }
}

/**
 * エージェントインターフェース
 */
export interface IAgent<
  TContext extends BaseAgentContext = BaseAgentContext,
  TResult extends AgentTurnResult = AgentTurnResult,
> {
  /** エージェント種別 */
  readonly type: AgentType
  /** 利用可能なツール */
  readonly tools: Tool[]
  /** 1ターンの実行 */
  executeTurn(context: TContext, userMessage: string): Promise<TResult>
}

/**
 * エージェントの依存関係
 */
export interface AgentDependencies {
  /** LLM プロバイダー（Orchestrator から注入） */
  // provider は Orchestrator が管理するため、ここでは定義しない
}
