import { forwardRef, useContext } from 'react'
import { cn } from '../../../lib'
import { tableCell } from './const'
import { TableContext } from './context'
import type { TableCellProps } from './type'

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(TableContext)

    return (
      <td ref={ref} className={cn(tableCell({ size: context?.size }), className)} {...props}>
        {children}
      </td>
    )
  }
)

TableCell.displayName = 'TableCell'
