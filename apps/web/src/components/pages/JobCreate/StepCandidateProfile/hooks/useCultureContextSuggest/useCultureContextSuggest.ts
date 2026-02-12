import { useCallback, useRef, useState } from 'react'
import { API_BASE_URL } from '@/lib/api/fetcher'

interface UseCultureContextSuggestReturn {
  suggest: (title: string) => void
  cancel: () => void
  text: string
  isStreaming: boolean
  error: string | null
}

export function useCultureContextSuggest(): UseCultureContextSuggestReturn {
  const [text, setText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const suggest = useCallback(
    (title: string) => {
      cancel()
      setError(null)
      setText('')
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller
      ;(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/jobs/suggest-culture-context`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response body')

          const decoder = new TextDecoder()
          let accumulated = ''
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                accumulated += line.slice(6)
                setText(accumulated)
              }
            }
          }

          setIsStreaming(false)
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setError(err instanceof Error ? err.message : 'Unknown error')
          setIsStreaming(false)
        }
      })()
    },
    [cancel]
  )

  return { suggest, cancel, text, isStreaming, error }
}
