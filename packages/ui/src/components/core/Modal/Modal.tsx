import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { cn } from '../../../lib'
import { Close } from '../../icon'
import { modal } from './const'
import { ModalContext } from './context'
import { useModal } from './hooks/useModal'
import type { ModalProps } from './type'

export const Modal = ({
  children,
  size = 'md',
  open,
  onOpenChange,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  title,
}: ModalProps) => {
  const { modalId, titleId, handleClose, handleOverlayClick, contentRef } = useModal({
    open,
    onOpenChange,
    closeOnOverlayClick,
    closeOnEscape,
  })

  const styles = modal({ size })

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
            ref={contentRef}
            id={modalId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn(styles.content(), className)}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ModalContext.Provider value={{ handleClose, modalId, titleId }}>
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton()}
                  onClick={handleClose}
                  aria-label="閉じる"
                >
                  <Close className="w-5 h-5" />
                </button>
              )}
              {children}
            </ModalContext.Provider>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
