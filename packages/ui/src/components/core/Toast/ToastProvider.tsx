import { useMemo } from 'react'
import { ToastContext } from './context'
import { ToastContainer } from './ToastContainer'
import { useToastState } from './hooks'
import type { ToastContextValue, ToastProviderProps } from './type'

export const ToastProvider = ({
  children,
  position = 'top-right',
  gap = 12,
  defaultDuration = 5000,
  maxToasts = 5,
}: ToastProviderProps) => {
  const toastState = useToastState({ defaultDuration, maxToasts })

  const contextValue: ToastContextValue = useMemo(
    () => ({
      ...toastState,
      config: {
        position,
        gap,
        defaultDuration,
        maxToasts,
      },
    }),
    [toastState, position, gap, defaultDuration, maxToasts]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position={position}
        toasts={toastState.toasts}
        onClose={toastState.removeToast}
        gap={gap}
      />
    </ToastContext.Provider>
  )
}
