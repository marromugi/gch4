import { Typography } from '@ding/ui'
import { Close } from '@ding/ui/icon'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { slidePanel } from './const'

export interface SlidePanelProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  width?: 'md' | 'lg' | 'xl'
  title?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export function SlidePanel({
  children,
  open,
  onOpenChange,
  width = 'lg',
  title,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: SlidePanelProps) {
  const panelId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const styles = slidePanel({ width })

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        handleClose()
      }
    },
    [closeOnOverlayClick, handleClose]
  )

  // ESCキーで閉じる
  useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, closeOnEscape, handleClose])

  // スクロールロック
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay()}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            className={styles.panel()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={styles.header()}>
              {title && (
                <Typography variant="body" size="lg" weight="semibold">
                  {title}
                </Typography>
              )}
              <button
                type="button"
                className={styles.closeButton()}
                onClick={handleClose}
                aria-label="閉じる"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>
            <div className={styles.body()}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
