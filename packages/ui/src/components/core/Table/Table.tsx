import { forwardRef } from 'react'
import { cn } from '../../../lib'
import { table } from './const'
import { TableContext } from './context'
import type { TableProps } from './type'

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, variant = 'default', size = 'md', className, ...props }, ref) => {
    const styles = table({ variant, size })

    return (
      <TableContext.Provider value={{ variant, size }}>
        <div className={styles.wrapper()}>
          <table ref={ref} className={cn(styles.root(), className)} {...props}>
            {children}
          </table>
        </div>
      </TableContext.Provider>
    )
  }
)

Table.displayName = 'Table'
