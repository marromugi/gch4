import { AuthContext } from './context'
import type { AuthClient } from './client'
import type { AuthContextValue } from './types'
import type { ReactNode } from 'react'

interface MockAuthProviderProps {
  children: ReactNode
  value?: Partial<AuthContextValue>
}

/**
 * Storybook・テスト用のモックAuthProvider
 */
export function MockAuthProvider({ children, value }: MockAuthProviderProps) {
  const mockValue: AuthContextValue = {
    client: {} as AuthClient,
    session: null,
    isPending: false,
    error: null,
    refetch: () => {},
    signInWithGoogle: async () => {
      console.log('[Mock] signInWithGoogle called')
    },
    signOut: async () => {
      console.log('[Mock] signOut called')
    },
    isAuthenticated: false,
    ...value,
  }

  return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>
}
