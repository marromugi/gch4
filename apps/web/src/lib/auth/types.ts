import type { AuthClient } from './client'

/**
 * ユーザー情報
 * バックエンドの User 型と同期
 */
export interface User {
  id: string
  email: string
  emailVerified: boolean
  name: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * セッション情報
 */
export interface Session {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  token: string
}

/**
 * セッションデータ（useSession の戻り値の data）
 */
export interface SessionData {
  user: User
  session: Session
}

/**
 * Auth コンテキストの値
 */
export interface AuthContextValue {
  /** Auth クライアントインスタンス */
  client: AuthClient
  /** セッションデータ */
  session: SessionData | null
  /** ローディング状態 */
  isPending: boolean
  /** エラー */
  error: Error | null
  /** セッション再取得 */
  refetch: () => void
  /** Google ログイン */
  signInWithGoogle: () => Promise<void>
  /** ログアウト */
  signOut: () => Promise<void>
  /** ログイン済みかどうか */
  isAuthenticated: boolean
}
