import { cn } from '../../../lib/utils'
import { grid } from './const'
import type { GridProps } from './type'

export const Grid = ({
  children,
  columns,
  rows,
  gap,
  flow,
  className,
  as: Component = 'div',
  ...props
}: GridProps) => {
  return (
    <Component className={cn(grid({ columns, rows, gap, flow }), className)} {...props}>
      {children}
    </Component>
  )
}
