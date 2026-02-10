import { useQuery, useQueryClient } from '@tanstack/react-query'
import { customFetch } from '../fetcher'

interface PendingAction {
  id: string
  userId: string
  tweetId: string | null
  sessionId: string | null
  name: string
  description: string | null
  prompt: string | null
  tool: string | null
  args: unknown
  metadata: {
    prompt?: string
    contexts?: string[]
    rollback?: { tool: string; args: unknown }
    error?: { code: string; message: string }
  } | null
  status: string
  executedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

interface PendingActionsResponse {
  actions: PendingAction[]
  count: number
}

export const PENDING_ACTIONS_QUERY_KEY = ['pending-actions'] as const

export function usePendingActions() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: PENDING_ACTIONS_QUERY_KEY,
    queryFn: async (): Promise<PendingActionsResponse> => {
      return customFetch<PendingActionsResponse>({
        url: 'API_BASE_URL/actions/pending',
        method: 'GET',
      })
    },
    refetchInterval: 30000,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: PENDING_ACTIONS_QUERY_KEY })
  }

  return {
    actions: query.data?.actions ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    invalidate,
  }
}

export type { PendingAction }
