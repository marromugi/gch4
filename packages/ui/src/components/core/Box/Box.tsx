import { cn } from '../../../lib/utils'
import { box } from './const'
import type { BoxProps } from './type'

const DEFAULT_BORDER = 'muted' as const

export const Box = ({
  children,
  background,
  border,
  elevation,
  className,
  as: Component = 'div',
  ...props
}: BoxProps) => {
  const borderVariant = border === true ? DEFAULT_BORDER : border || undefined

  return (
    <Component
      className={cn(box({ background, border: borderVariant, elevation }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}
