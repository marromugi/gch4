import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { UsePopoverParams, UsePopoverReturn } from './type'

export const usePopover = ({
  disabled,
  open: controlledOpen,
  onOpenChange,
}: UsePopoverParams): UsePopoverReturn => {
  const [internalOpen, setInternalOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const popoverId = useId()

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  /** トリガークリックで開閉をトグル */
  const handleToggle = useCallback(() => {
    if (disabled) return
    setOpen(!isOpen)
  }, [disabled, isOpen, setOpen])

  /** ポップオーバーを閉じる */
  const handleClose = useCallback(() => {
    if (disabled) return
    setOpen(false)
  }, [disabled, setOpen])

  // 外部クリック検知
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen, setOpen])

  // Escape キー検知
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, setOpen])

  return {
    isOpen,
    popoverId,
    handleToggle,
    handleClose,
    wrapperRef,
  }
}
