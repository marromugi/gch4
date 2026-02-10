import { createContext } from 'react'
import type { ToastContextValue } from './type'

export const ToastContext = createContext<ToastContextValue | null>(null)
