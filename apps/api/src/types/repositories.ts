import type { Database } from '@ding/database/client'

/**
 * データベースベースのリポジトリの型定義
 */
export interface DatabaseRepositories {}

/**
 * アプリケーション全体で使用するリポジトリの型定義
 * 新しいリポジトリを追加する場合はここに追加する
 */
export interface Repositories extends DatabaseRepositories {}

/**
 * アプリケーション全体で使用するサービスの型定義
 */
export interface Services {}

/**
 * インフラストラクチャ層の型定義
 */
export interface Infrastructure {}

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
