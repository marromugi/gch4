import type { DIContainer } from './repositories'
import type { Auth, Session, User } from '../lib/auth'

/** Cloudflare Workers 環境変数の型 */
export type Bindings = {
  DATABASE_URL: string
  DATABASE_AUTH_TOKEN?: string
  CLIENT_URL?: string
  BETTER_AUTH_URL?: string
  BETTER_AUTH_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GEMINI_API_KEY: string
  GEMINI_MODEL?: string
  AGENT_LOG_DIR?: string

  // KVStore 設定
  /** KVStore の種別: 'cloudflare' | 'firestore' | 'memory' */
  KV_STORE_TYPE?: string
  /** Cloudflare KV namespace for session storage (KV_STORE_TYPE='cloudflare' の場合) */
  SESSIONS?: KVNamespace
  /** Firestore Project ID (KV_STORE_TYPE='firestore' の場合) */
  FIRESTORE_PROJECT_ID?: string
  /** Firestore Database ID (KV_STORE_TYPE='firestore' の場合、デフォルト: '(default)') */
  FIRESTORE_DATABASE_ID?: string
  /** Firestore Collection Name (KV_STORE_TYPE='firestore' の場合、デフォルト: 'kv-store') */
  FIRESTORE_COLLECTION_NAME?: string
}

export type HonoEnv = {
  Bindings: Bindings
  Variables: {
    user: User | null
    session: Session | null
    auth: Auth
    di: DIContainer
  }
}
