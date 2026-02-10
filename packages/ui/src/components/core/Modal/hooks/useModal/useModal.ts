import { useCallback, useEffect, useId, useRef } from 'react'
import type { UseModalParams, UseModalReturn } from './type'

export const useModal = ({
  open,
  onOpenChange,
  closeOnOverlayClick,
  closeOnEscape,
}: UseModalParams): UseModalReturn => {
  const modalId = useId()
  const titleId = `${modalId}-title`
  const contentRef = useRef<HTMLDivElement | null>(null)

  /** モーダルを閉じる */
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  /** オーバーレイクリック処理 */
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (contentRef.current?.contains(event.target as Node)) {
        return
      }
      if (closeOnOverlayClick) {
        handleClose()
      }
    },
    [closeOnOverlayClick, handleClose]
  )

  // Escape キー検知
  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, handleClose])

  // スクロールロック
  useEffect(() => {
    if (!open) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  // フォーカストラップ
  useEffect(() => {
    if (!open || !contentRef.current) return

    const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // 初期フォーカス
    firstElement?.focus()

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [open])

  return {
    modalId,
    titleId,
    handleClose,
    handleOverlayClick,
    contentRef,
  }
}
