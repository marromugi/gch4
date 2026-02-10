import { forwardRef, useContext } from 'react'
import { cn } from '../../../lib'
import { tableBody } from './const'
import { TableContext } from './context'
import type { TableBodyProps } from './type'

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className, ...props }, ref) => {
    const context = useContext(TableContext)

    return (
      <tbody
        ref={ref}
        className={cn(tableBody({ variant: context?.variant }), className)}
        {...props}
      >
        {children}
      </tbody>
    )
  }
)

TableBody.displayName = 'TableBody'
