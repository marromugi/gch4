import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_auth')({
  component: AuthLayoutRoute,
})

function AuthLayoutRoute() {
  const router = useRouter()
  const { isAuthenticated, isPending } = useAuth()

  // 未認証時はログインページにリダイレクト
  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      router.navigate({ to: '/login' })
    }
  }, [isAuthenticated, isPending, router])

  // ローディング中
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 未認証時（リダイレクト中）
  if (!isAuthenticated) {
    return null
  }

  return <Outlet />
}
