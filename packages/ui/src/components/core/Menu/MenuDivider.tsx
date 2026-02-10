import { cn } from '../../../lib/utils'
import { menuDivider } from './const'
import type { MenuDividerProps } from './type'

export const MenuDivider = ({ className, ...props }: MenuDividerProps) => {
  return <hr role="separator" className={cn(menuDivider(), className)} {...props} />
}
