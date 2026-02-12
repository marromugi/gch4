import type { Database } from '@ding/database/client'
import type { IJobRepository } from '@ding/domain/domain/repository'
import type { IApplicationRepository } from '@ding/domain/domain/repository'
import type { IReviewPolicyRepository } from '@ding/domain/domain/repository'
import type { IInterviewFeedbackRepository } from '@ding/domain/domain/repository'
import type { IEventLogRepository } from '@ding/domain/domain/repository'
import type { ApplicationSubmissionService, FallbackService } from '@ding/domain/domain/service'
import type { ILLMProvider } from '@ding/agent/provider'

/**
 * データベースベースのリポジトリの型定義
 */
export interface DatabaseRepositories {
  jobRepository: IJobRepository
  applicationRepository: IApplicationRepository
  reviewPolicyRepository: IReviewPolicyRepository
  interviewFeedbackRepository: IInterviewFeedbackRepository
  eventLogRepository: IEventLogRepository
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
  submissionService: ApplicationSubmissionService
  fallbackService: FallbackService
}

/**
 * インフラストラクチャ層の型定義
 */
export interface Infrastructure {
  llmProvider: ILLMProvider
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
