import { useCallback, useRef, useState } from 'react'
import { API_BASE_URL } from '@/lib/api/fetcher'

interface ThemeSuggestion {
  title: string
  purpose: string
  completionMessage: string
}

interface UseThemeSuggestReturn {
  suggest: () => void
  theme: ThemeSuggestion | null
  isLoading: boolean
  error: string | null
}

export function useThemeSuggest(): UseThemeSuggestReturn {
  const [theme, setTheme] = useState<ThemeSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const suggest = useCallback(() => {
    abortRef.current?.abort()
    setError(null)
    setTheme(null)
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    ;(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/forms/suggest-theme`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller.signal,
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as { data: ThemeSuggestion }
        setTheme(data.data)
        setIsLoading(false)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    })()
  }, [])

  return { suggest, theme, isLoading, error }
}
