import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type ReactNode, useState } from 'react'
import { createQueryClient } from './client'

type ApiClientProviderProps = {
  children: ReactNode
  showDevtools?: boolean
}

export function ApiClientProvider({
  children,
  showDevtools = import.meta.env.DEV,
}: ApiClientProviderProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
