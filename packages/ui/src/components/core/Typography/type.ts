import type { typography } from './const'
import type { HTMLAttributes, ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'

export interface TypographyProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof typography> {
  children: ReactNode
  className?: string
  as?: 'span' | 'p' | 'div' | 'label'
}
