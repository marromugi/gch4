import { useContext } from 'react'
import { cn } from '../../../lib'
import { modalHeader } from './const'
import { ModalContext } from './context'
import type { ModalHeaderProps } from './type'

export const ModalHeader = ({ children, className, ...props }: ModalHeaderProps) => {
  const context = useContext(ModalContext)

  return (
    <div className={cn(modalHeader(), className)} {...props}>
      <h2
        id={context?.titleId}
        className="text-lg font-semibold text-neutral-900 dark:text-neutral-50"
      >
        {children}
      </h2>
    </div>
  )
}
