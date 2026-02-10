import { createContext } from 'react'
import type { TableContextValue } from './type'

export const TableContext = createContext<TableContextValue | null>(null)
