import { forwardRef } from 'react'
import { cn } from '../../../lib'
import { tableFooter } from './const'
import type { TableFooterProps } from './type'

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <tfoot ref={ref} className={cn(tableFooter(), className)} {...props}>
        {children}
      </tfoot>
    )
  }
)

TableFooter.displayName = 'TableFooter'
