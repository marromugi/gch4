import type { ILLMProvider, IKVStore, AgentRegistry, ILogger } from '@ding/agent'
import type { Database } from '@ding/database/client'
import type {
  IFormRepository,
  ISubmissionRepository,
  IEventLogRepository,
  IToolCallLogRepository,
} from '@ding/domain/domain/repository'

/**
 * データベースベースのリポジトリの型定義
 */
export interface DatabaseRepositories {
  formRepository: IFormRepository
  submissionRepository: ISubmissionRepository
  eventLogRepository: IEventLogRepository
  toolCallLogRepository: IToolCallLogRepository
}

/**
 * アプリケーション全体で使用するリポジトリの型定義
 * 新しいリポジトリを追加する場合はここに追加する
 */
export interface Repositories extends DatabaseRepositories {}

/**
 * インフラストラクチャ層の型定義
 */
export interface Infrastructure {
  /** LLM プロバイダー */
  llmProvider: ILLMProvider
  /** KV ストア */
  kvStore: IKVStore
  /** エージェントレジストリ */
  agentRegistry: AgentRegistry
  /** ロガー */
  logger: ILogger
}

/**
 * DI コンテナの型定義
 */
export interface DIContainer {
  /** Drizzle データベースインスタンス */
  db: Database
  /** リポジトリインスタンス */
  repositories: Repositories
  /** インフラストラクチャ層 */
  infrastructure: Infrastructure
}
