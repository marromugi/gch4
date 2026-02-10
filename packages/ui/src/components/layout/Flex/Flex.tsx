import { cn } from '../../../lib/utils'
import { flex } from './const'
import type { FlexProps } from './type'

export const Flex = ({
  children,
  direction,
  justify,
  align,
  wrap,
  gap,
  inline,
  className,
  as: Component = 'div',
  ...props
}: FlexProps) => {
  return (
    <Component
      className={cn(flex({ direction, justify, align, wrap, gap, inline }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}
