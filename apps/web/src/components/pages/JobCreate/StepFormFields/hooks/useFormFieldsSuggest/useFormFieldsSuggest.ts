import { useCallback, useRef, useState } from 'react'
import { API_BASE_URL } from '@/lib/api/fetcher'
import type { FormFieldItem } from '../../../type'

interface UseFormFieldsSuggestReturn {
  suggest: (title: string, idealCandidate: string | null, cultureContext: string | null) => void
  formFields: FormFieldItem[] | null
  isLoading: boolean
  error: string | null
}

export function useFormFieldsSuggest(): UseFormFieldsSuggestReturn {
  const [formFields, setFormFields] = useState<FormFieldItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const suggest = useCallback(
    (title: string, idealCandidate: string | null, cultureContext: string | null) => {
      abortRef.current?.abort()
      setError(null)
      setFormFields(null)
      setIsLoading(true)

      const controller = new AbortController()
      abortRef.current = controller
      ;(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/jobs/suggest-form-fields`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, idealCandidate, cultureContext }),
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = (await response.json()) as { formFields: FormFieldItem[] }
          setFormFields(data.formFields)
          setIsLoading(false)
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setError(err instanceof Error ? err.message : 'Unknown error')
          setIsLoading(false)
        }
      })()
    },
    []
  )

  return { suggest, formFields, isLoading, error }
}
