import { useCallback, useContext, useRef, useState } from 'react'
import { ToastContext } from '../../context'
import { generateToastId } from '../../utils'
import type { ReactNode } from 'react'
import type { ToastContextValue, ToastData, ToastOptions, UseToastReturn } from '../../type'
import type { UseToastStateParams } from './type'

/** 内部用: Toast状態管理hook */
export const useToastState = ({
  defaultDuration,
  maxToasts,
}: UseToastStateParams): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  /** タイマーをクリア */
  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  /** Toastを削除 */
  const removeToast = useCallback(
    (id: string) => {
      clearTimer(id)
      setToasts((prev) => {
        const toast = prev.find((t) => t.id === id)
        toast?.onClose?.()
        return prev.filter((t) => t.id !== id)
      })
    },
    [clearTimer]
  )

  /** Toastを追加 */
  const addToast = useCallback(
    (options: ToastOptions): string => {
      const id = generateToastId()
      const duration = options.duration ?? defaultDuration

      const newToast: ToastData = {
        id,
        type: 'default',
        closable: true,
        showIcon: true,
        ...options,
        duration,
      }

      setToasts((prev) => {
        // 最大数を超えた場合、古いものを削除
        const updated = [...prev, newToast]
        if (updated.length > maxToasts) {
          const toRemove = updated.slice(0, updated.length - maxToasts)
          toRemove.forEach((t) => clearTimer(t.id))
          return updated.slice(-maxToasts)
        }
        return updated
      })

      // 自動消去タイマー設定
      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id)
        }, duration)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [defaultDuration, maxToasts, removeToast, clearTimer]
  )

  /** 全Toastを削除 */
  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current.clear()
    setToasts([])
  }, [])

  /** ショートカット: success */
  const success = useCallback(
    (title: ReactNode, options?: Partial<ToastOptions>) =>
      addToast({ title, type: 'success', ...options }),
    [addToast]
  )

  /** ショートカット: error */
  const error = useCallback(
    (title: ReactNode, options?: Partial<ToastOptions>) =>
      addToast({ title, type: 'error', ...options }),
    [addToast]
  )

  /** ショートカット: warning */
  const warning = useCallback(
    (title: ReactNode, options?: Partial<ToastOptions>) =>
      addToast({ title, type: 'warning', ...options }),
    [addToast]
  )

  /** ショートカット: info */
  const info = useCallback(
    (title: ReactNode, options?: Partial<ToastOptions>) =>
      addToast({ title, type: 'info', ...options }),
    [addToast]
  )

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}

/** 公開用: ToastContextからToast操作関数を取得 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
