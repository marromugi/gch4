import { createContext } from 'react'
import type { MenuContextValue } from './type'

export const MenuContext = createContext<MenuContextValue | null>(null)
