import { ToastProvider } from '@ding/ui'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

// import.meta.env.PROD
const TanStackRouterDevtools =
  1 === Number(1)
    ? () => null
    : lazy(() =>
        import('@tanstack/react-router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      )

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ToastProvider>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </ToastProvider>
  )
}
