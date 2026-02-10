import { useCallback, useRef, useState } from 'react'
import type { UseEnterActionParams, UseEnterActionReturn } from './type'

export const useEnterAction = ({
  mode,
  onSubmit,
  onModeChange,
}: UseEnterActionParams): UseEnterActionReturn => {
  const composingRef = useRef(false)
  const [isComposing, setIsComposing] = useState(false)

  const toggleMode = useCallback(() => {
    const next = mode === 'submit' ? 'newline' : 'submit'
    onModeChange?.(next)
  }, [mode, onModeChange])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const nativeEvent = e.nativeEvent as globalThis.KeyboardEvent
      if (nativeEvent.isComposing || e.keyCode === 229 || composingRef.current) return

      if (e.key === 'Enter') {
        if (mode === 'submit') {
          if (e.shiftKey) return
          e.preventDefault()
          onSubmit()
        } else {
          if (e.shiftKey) {
            e.preventDefault()
            onSubmit()
          }
        }
      }
    },
    [mode, onSubmit]
  )

  const onCompositionStart = useCallback(() => {
    composingRef.current = true
    setIsComposing(true)
  }, [])

  const onCompositionEnd = useCallback(() => {
    composingRef.current = false
    setIsComposing(false)
  }, [])

  return {
    mode,
    isComposing,
    toggleMode,
    handlers: {
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
    },
  }
}
