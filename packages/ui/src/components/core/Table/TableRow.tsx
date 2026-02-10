import { forwardRef } from 'react'
import { cn } from '../../../lib'
import { tableRow } from './const'
import type { TableRowProps } from './type'

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, selected = false, className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(tableRow({ selected }), className)}
        aria-selected={selected ? true : undefined}
        {...props}
      >
        {children}
      </tr>
    )
  }
)

TableRow.displayName = 'TableRow'
