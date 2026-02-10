import type { grid } from './const'
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

export interface GridProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof grid> {
  children?: ReactNode
  className?: string
  as?: ContainerElement
}
