import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { UseTooltipParams, UseTooltipReturn } from './type'

const WARMUP_THRESHOLD = 300

export const useTooltip = ({ delay, disabled }: UseTooltipParams): UseTooltipReturn => {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCloseRef = useRef<number>(0)
  const tooltipId = useId()

  const clearDelay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleOpen = useCallback(() => {
    if (disabled) return
    clearDelay()
    const elapsed = Date.now() - lastCloseRef.current
    if (delay > 0 && elapsed > WARMUP_THRESHOLD) {
      timeoutRef.current = setTimeout(() => setIsOpen(true), delay)
    } else {
      setIsOpen(true)
    }
  }, [delay, disabled, clearDelay])

  const handleClose = useCallback(() => {
    if (disabled) return
    clearDelay()
    lastCloseRef.current = Date.now()
    setIsOpen(false)
  }, [disabled, clearDelay])

  useEffect(() => {
    return () => clearDelay()
  }, [clearDelay])

  return { isOpen, tooltipId, handleOpen, handleClose }
}
