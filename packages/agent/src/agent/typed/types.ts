import type { LLMMessage, TokenUsage } from '../../provider'
import type { AgentFactoryDeps, AgentState } from '../../registry/types'
import type { Tool } from '../../tools'
import type { AgentType, ToolCallResult } from '../types'
import type { z } from 'zod'

/**
 * エージェントの言語設定
 */
export interface AgentLanguageState {
  /** 言語コード (ja, en, zh, ko など) */
  language?: string
}

/**
 * エージェントへの基本入力
 * executeTurn の context から分離され、共通部分のみを含む
 */
export interface AgentBaseInput {
  /** セッションID */
  sessionId: string
  /** 会話履歴 */
  chatHistory: LLMMessage[]
  /** 言語設定 */
  state?: AgentLanguageState
}

/**
 * 型付きエージェントのターン結果
 * TResult は completion.context の型
 */
export interface TypedTurnResult<TResult> {
  /** レスポンステキスト */
  responseText: string
  /** ツール呼び出し */
  toolCalls?: ToolCallResult[]
  /** 完了時の結果（あれば完了、なければ継続） */
  completion?: { context: TResult }
  /** ユーザーの回答を待っているか */
  awaitingUserResponse?: boolean
  /** トークン使用量 */
  usage?: TokenUsage
}

/**
 * 型付きエージェントインターフェース
 *
 * TArgs: エージェント固有の引数型（definition.argsSchema から推論）
 * TResult: エージェントの結果型（definition.resultSchema から推論）
 */
export interface ITypedAgent<TArgs, TResult> {
  /** エージェント種別 */
  readonly type: AgentType
  /** 利用可能なツール */
  readonly tools: Tool[]

  /**
   * 型安全な実行メソッド
   *
   * @param args エージェント固有の引数（Zod スキーマから推論）
   * @param base 共通の基本入力
   * @param userMessage ユーザーメッセージ（空の場合もある）
   */
  execute(args: TArgs, base: AgentBaseInput, userMessage: string): Promise<TypedTurnResult<TResult>>
}

/**
 * 型付きエージェント定義
 *
 * 既存の AgentDefinition と並行して使用可能。
 * createAgent の戻り値が ITypedAgent になり、型安全性が向上。
 */
export interface TypedAgentDefinition<
  TArgsSchema extends z.ZodType,
  TResultSchema extends z.ZodType,
> {
  /** エージェント種別 */
  type: AgentType

  /** 引数スキーマ */
  argsSchema: TArgsSchema

  /** 結果スキーマ */
  resultSchema: TResultSchema

  /**
   * システムプロンプトを構築
   */
  buildSystemPrompt: (args: z.infer<TArgsSchema>, state: AgentState) => string

  /**
   * 初期メッセージを構築
   */
  buildInitialMessage: (args: z.infer<TArgsSchema>) => LLMMessage | null

  /**
   * 型付きエージェントファクトリ
   * 戻り値の型が ITypedAgent<TArgs, TResult> になり、型安全
   */
  createTypedAgent: (
    deps: AgentFactoryDeps
  ) => ITypedAgent<z.infer<TArgsSchema>, z.infer<TResultSchema>>

  /** サブエージェントとして呼び出し可能か */
  isSubtaskable: boolean
}
