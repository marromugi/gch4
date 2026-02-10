import { createAuthClient } from 'better-auth/react'

/**
 * Auth クライアント設定オプション
 */
export interface AuthClientConfig {
  /** API サーバーのベースURL */
  baseURL: string
}

/**
 * Auth クライアントを作成する
 * Web と Desktop で異なる baseURL を使用可能
 */
export function createAppAuthClient(config: AuthClientConfig) {
  return createAuthClient({
    baseURL: config.baseURL,
  })
}

/**
 * Auth クライアントの型
 */
export type AuthClient = ReturnType<typeof createAppAuthClient>
