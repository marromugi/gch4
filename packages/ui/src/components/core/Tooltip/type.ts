import type { tooltip } from './const'
import type { HTMLAttributes, ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'

/** ツールチップの表示位置 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

/** ツールチップの揃え位置 */
export type TooltipAlign = 'start' | 'center' | 'end'

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content'>, VariantProps<typeof tooltip> {
  /** ツールチップの内容 */
  content: ReactNode
  /** 表示位置 @default 'top' */
  placement?: TooltipPlacement
  /** 揃え位置 @default 'center' */
  align?: TooltipAlign
  /** ホバーから表示までの遅延（ms） @default 0 */
  delay?: number
  /** 矢印を表示するか @default true */
  arrow?: boolean
  /** トリガー要素からの距離（px） @default 8 */
  offset?: number
  /** ツールチップを無効にするか @default false */
  disabled?: boolean
  /** カスタムクラス（ツールチップ本体に適用） */
  className?: string
  /** トリガー要素 */
  children: ReactNode
}
