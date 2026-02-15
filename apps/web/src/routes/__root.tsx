import { ToastProvider } from '@ding/ui'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ToastProvider>
      <Outlet />
      <Suspense>{/* <TanStackRouterDevtools /> */}</Suspense>
    </ToastProvider>
  )
}
