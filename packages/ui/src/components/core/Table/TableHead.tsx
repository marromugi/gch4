import { forwardRef, useContext } from 'react'
import { cn } from '../../../lib'
import { tableHead } from './const'
import { TableContext } from './context'
import type { TableHeadProps } from './type'

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(TableContext)

    return (
      <th ref={ref} className={cn(tableHead({ size: context?.size }), className)} {...props}>
        {children}
      </th>
    )
  }
)

TableHead.displayName = 'TableHead'
