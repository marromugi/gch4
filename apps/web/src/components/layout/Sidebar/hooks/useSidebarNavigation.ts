import { useLocation } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useSidebarNavigation() {
  const location = useLocation()

  const isPathActive = useCallback(
    (paths: string[]) => {
      return paths.some((path) => {
        const pattern = path.replace(/:[^/]+/g, '[^/]+')
        const regex = new RegExp(`^${pattern}($|/)`)
        return regex.test(location.pathname)
      })
    },
    [location.pathname]
  )

  return { isPathActive, currentPath: location.pathname }
}
