import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react'
import { createAppAuthClient, type AuthClientConfig } from './client'
import type { AuthContextValue, SessionData } from './types'

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  /** Auth クライアント設定 */
  config: AuthClientConfig
  /** ログイン後のリダイレクトパス */
  callbackURL?: string
  /** サインアウト後のリダイレクトパス */
  signOutRedirectURL?: string
  children: ReactNode
}

/**
 * 認証を提供する Provider
 * 各アプリ（Web/Desktop）のルートで PlatformProvider の後に配置
 */
export function AuthProvider({
  config,
  callbackURL = '/',
  signOutRedirectURL = '/login',
  children,
}: AuthProviderProps) {
  // Auth クライアントを作成（メモ化）
  const client = useMemo(() => createAppAuthClient(config), [config])

  // useSession フックを使用してセッション状態を取得
  const {
    data: session,
    isPending,
    error,
    refetch,
  } = client.useSession() as {
    data: SessionData | null
    isPending: boolean
    error: Error | null
    refetch: () => void
  }

  // Google ログイン
  const signInWithGoogle = useCallback(async () => {
    await client.signIn.social({
      provider: 'google',
      callbackURL,
    })
  }, [client, callbackURL])

  // ログアウト
  const signOut = useCallback(async () => {
    await client.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = signOutRedirectURL
        },
      },
    })
  }, [client, signOutRedirectURL])

  const value: AuthContextValue = useMemo(
    () => ({
      client,
      session,
      isPending,
      error,
      refetch,
      signInWithGoogle,
      signOut,
      isAuthenticated: !!session?.user,
    }),
    [client, session, isPending, error, refetch, signInWithGoogle, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Auth コンテキストを取得するフック
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
