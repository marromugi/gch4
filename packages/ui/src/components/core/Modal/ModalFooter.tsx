import { cn } from '../../../lib'
import { modalFooter } from './const'
import type { ModalFooterProps } from './type'

export const ModalFooter = ({ children, className, ...props }: ModalFooterProps) => {
  return (
    <div className={cn(modalFooter(), className)} {...props}>
      {children}
    </div>
  )
}
