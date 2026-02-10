import { forwardRef } from 'react'
import { cn } from '../../../lib'
import { tableCaption } from './const'
import type { TableCaptionProps } from './type'

export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <caption ref={ref} className={cn(tableCaption(), className)} {...props}>
        {children}
      </caption>
    )
  }
)

TableCaption.displayName = 'TableCaption'
