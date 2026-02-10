import { forwardRef } from 'react'
import { cn } from '../../../lib'
import { tableHeader } from './const'
import type { TableHeaderProps } from './type'

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <thead ref={ref} className={cn(tableHeader(), className)} {...props}>
        {children}
      </thead>
    )
  }
)

TableHeader.displayName = 'TableHeader'
