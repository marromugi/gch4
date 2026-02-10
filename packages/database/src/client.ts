import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

/** データベース環境変数の型 */
export type DatabaseEnv = {
  DATABASE_URL: string
  DATABASE_AUTH_TOKEN?: string
}

/**
 * データベースクライアントを作成するファクトリ関数
 * Cloudflare Workers環境ではc.envから環境変数を渡す
 */
export function createDatabase(env: DatabaseEnv) {
  // リモート Turso (libsql:// or https://) の場合は authToken が必要
  const isRemoteTurso =
    env.DATABASE_URL.startsWith('libsql://') || env.DATABASE_URL.startsWith('https://')

  const tursoClient = createClient({
    url: env.DATABASE_URL,
    authToken: isRemoteTurso ? env.DATABASE_AUTH_TOKEN : undefined,
  })

  return drizzle(tursoClient, { schema })
}

/** データベースの型 */
export type Database = ReturnType<typeof createDatabase>
