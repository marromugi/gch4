import { createContext } from 'react'
import type { ModalContextValue } from './type'

export const ModalContext = createContext<ModalContextValue | null>(null)
