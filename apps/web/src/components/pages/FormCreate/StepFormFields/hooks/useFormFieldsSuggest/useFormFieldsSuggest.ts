import { useCallback, useRef, useState } from 'react'
import { API_BASE_URL } from '@/lib/api/fetcher'
import type { FormFieldItem } from '../../../type'

interface UseFormFieldsSuggestReturn {
  suggest: (title: string, purpose: string | null) => void
  formFields: FormFieldItem[] | null
  isLoading: boolean
  error: string | null
}

export function useFormFieldsSuggest(): UseFormFieldsSuggestReturn {
  const [formFields, setFormFields] = useState<FormFieldItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const suggest = useCallback((title: string, purpose: string | null) => {
    abortRef.current?.abort()
    setError(null)
    setFormFields(null)
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    ;(async () => {
      try {
        const description = purpose ? `${title}: ${purpose}` : title
        const response = await fetch(`${API_BASE_URL}/api/forms/suggest-fields`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description }),
          signal: controller.signal,
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as { data: { fields: FormFieldItem[] } }
        setFormFields(data.data.fields)
        setIsLoading(false)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    })()
  }, [])

  return { suggest, formFields, isLoading, error }
}
