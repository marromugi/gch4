import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '../../../lib'
import { CheckCircleFill, Close, ErrorFill, InfoFill, WarningFill } from '../../icon'
import { toast as toastStyles } from './const'
import { getToastMotionProps } from './utils'
import type { ToastProps, ToastType } from './type'

const iconClass = 'w-6 h-6 -ml-2'

/** タイプに応じたアイコンを取得 */
const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircleFill className={iconClass} />
    case 'error':
      return <ErrorFill className={iconClass} />
    case 'warning':
      return <WarningFill className={iconClass} />
    case 'info':
      return <InfoFill className={iconClass} />
    default:
      return null
  }
}

export const Toast = ({ data, onClose, position }: ToastProps) => {
  const {
    id,
    type = 'default',
    title,
    message,
    closable = true,
    showIcon = true,
    icon,
    duration = 5000,
  } = data
  const styles = toastStyles({ type })
  const motionProps = getToastMotionProps(position)

  // プログレスバー用の状態
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration <= 0) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  const displayIcon = icon ?? (showIcon && type !== 'default' ? getIcon(type) : null)

  return (
    <motion.div
      key={id}
      layout
      className={cn(styles.item())}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      {...motionProps}
    >
      {displayIcon && <span className={styles.iconWrapper()}>{displayIcon}</span>}

      <div className={styles.content()}>
        <p className={styles.title()}>{title}</p>
        {message && <p className={styles.message()}>{message}</p>}
      </div>

      {closable && (
        <button
          type="button"
          className={styles.closeButton()}
          onClick={onClose}
          aria-label="閉じる"
        >
          <Close className="w-4 h-4" />
        </button>
      )}

      {duration > 0 && (
        <motion.div
          className={styles.progressBar()}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}
