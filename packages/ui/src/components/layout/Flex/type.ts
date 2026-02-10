import type { flex } from './const'
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

export interface FlexProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof flex> {
  children?: ReactNode
  className?: string
  as?: ContainerElement
  inline?: boolean
}
