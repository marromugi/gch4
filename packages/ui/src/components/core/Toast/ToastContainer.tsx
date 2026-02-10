import { AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import { toast as toastStyles } from './const'
import { Toast } from './Toast'
import type { ToastContainerProps } from './type'

export const ToastContainer = ({ position, toasts, onClose, gap }: ToastContainerProps) => {
  const styles = toastStyles({ position })

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className={styles.container()} style={{ gap }} aria-label="通知">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            data={toast}
            onClose={() => onClose(toast.id)}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
