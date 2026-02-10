import { cn } from '../../../lib'
import { modalBody } from './const'
import type { ModalBodyProps } from './type'

export const ModalBody = ({ children, className, ...props }: ModalBodyProps) => {
  return (
    <div className={cn(modalBody(), className)} {...props}>
      {children}
    </div>
  )
}
