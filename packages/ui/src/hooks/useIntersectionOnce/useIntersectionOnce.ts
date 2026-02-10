import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseIntersectionOnceParams, UseIntersectionOnceReturn } from './type'

export function useIntersectionOnce({
  onIntersect,
  threshold = 0.1,
  rootMargin,
  disabled = false,
}: UseIntersectionOnceParams): UseIntersectionOnceReturn {
  const ref = useRef<HTMLDivElement | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const hasTriggeredRef = useRef(false)

  const reset = useCallback(() => {
    hasTriggeredRef.current = false
    setHasTriggered(false)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || disabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          setHasTriggered(true)
          onIntersect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [onIntersect, threshold, rootMargin, disabled])

  return { ref, hasTriggered, reset }
}
