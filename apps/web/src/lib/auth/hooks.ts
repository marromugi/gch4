import { useAuthContext } from './context'
import type { User, SessionData } from './types'

/**
 * 認証に関するメインフック
 */
export function useAuth() {
  const { session, isPending, error, signInWithGoogle, signOut, isAuthenticated } = useAuthContext()

  return {
    /** ログイン済みかどうか */
    isAuthenticated,
    /** ローディング中かどうか */
    isPending,
    /** エラー */
    error,
    /** Google でログイン */
    signInWithGoogle,
    /** ログアウト */
    signOut,
    /** ユーザー情報（未ログイン時は null） */
    user: session?.user ?? null,
    /** セッション情報（未ログイン時は null） */
    session: session?.session ?? null,
  }
}

/**
 * セッション情報を取得するフック
 */
export function useSession(): {
  data: SessionData | null
  isPending: boolean
  error: Error | null
  refetch: () => void
} {
  const { session, isPending, error, refetch } = useAuthContext()
  return { data: session, isPending, error, refetch }
}

/**
 * ユーザー情報を取得するフック
 */
export function useUser(): User | null {
  const { session } = useAuthContext()
  return session?.user ?? null
}

/**
 * 認証済みかどうかを取得するフック
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthContext()
  return isAuthenticated
}
