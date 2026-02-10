import { createContext } from 'react'
import type { RadioGroupContextValue } from './type'

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)
