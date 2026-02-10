import { cn } from '../../../lib/utils'
import { typography } from './const'
import type { TypographyProps } from './type'

export const Typography = ({
  children,
  variant,
  size,
  weight,
  className,
  as: Component = 'span',
  ...props
}: TypographyProps) => {
  return (
    <Component
      data-variant={variant}
      className={cn(typography({ variant, size, weight }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}
