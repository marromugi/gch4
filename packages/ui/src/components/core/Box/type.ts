import type { box } from './const'
import type { HTMLAttributes, ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'

type ContainerElement =
  | 'div'
  | 'section'
  | 'article'
  | 'main'
  | 'aside'
  | 'header'
  | 'footer'
  | 'nav'

type BorderVariant = NonNullable<VariantProps<typeof box>['border']>

export interface BoxProps
  extends HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof box>, 'border'> {
  children?: ReactNode
  className?: string
  as?: ContainerElement
  border?: boolean | BorderVariant
}
