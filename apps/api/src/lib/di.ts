import type { HonoEnv } from '../types/hono'
import type { Repositories, Services } from '../types/repositories'
import type { Database } from '@ding/database/client'
import type { Context } from 'hono'

/**
 * コンテキストからリポジトリを取得するヘルパー関数
 */
export function getRepositories(c: Context<HonoEnv>): Repositories {
  return c.get('di').repositories
}

/**
 * コンテキストからデータベースを取得するヘルパー関数
 */
export function getDatabase(c: Context<HonoEnv>): Database {
  return c.get('di').db
}

/**
 * コンテキストから特定のリポジトリを取得するヘルパー関数
 */
export function getRepository<K extends keyof Repositories>(
  c: Context<HonoEnv>,
  name: K
): Repositories[K] {
  return c.get('di').repositories[name]
}

/**
 * コンテキストからサービスを取得するヘルパー関数
 */
export function getServices(c: Context<HonoEnv>): Services {
  return c.get('di').services
}
