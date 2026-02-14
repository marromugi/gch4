import type { ILLMProvider, IKVStore, AgentRegistry } from '@ding/agent'
import type { Database } from '@ding/database/client'
import type {
  IFormRepository,
  ISubmissionRepository,
  IEventLogRepository,
  IToolCallLogRepository,
} from '@ding/domain/domain/repository'
import type { FallbackService } from '@ding/domain/domain/service'

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
 * アプリケーション全体で使用するサービスの型定義
 */
export interface Services {
  fallbackService: FallbackService
}

/**
 * インフラストラクチャ層の型定義
 */
export interface Infrastructure {
  /** LLM プロバイダー */
  llmProvider: ILLMProvider
  /** KV ストア (OrchestratorV2 用) */
  kvStore: IKVStore
  /** エージェントレジストリ (OrchestratorV2 用) */
  agentRegistry: AgentRegistry
}

/**
 * DI コンテナの型定義
 */
export interface DIContainer {
  /** Drizzle データベースインスタンス */
  db: Database
  /** リポジトリインスタンス */
  repositories: Repositories
  /** サービスインスタンス */
  services: Services
  /** インフラストラクチャ層 */
  infrastructure: Infrastructure
}
