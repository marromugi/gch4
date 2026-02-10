import { cn } from '../../../lib/utils'
import { icon } from './const'
import type { IconProps } from './type'

export const Icon = ({ icon: IconComponent, size, variant, className, ...props }: IconProps) => {
  return (
    <IconComponent
      className={cn(icon({ size, variant }), className)}
      width="100%"
      height="100%"
      aria-hidden="true"
      {...props}
    />
  )
}
