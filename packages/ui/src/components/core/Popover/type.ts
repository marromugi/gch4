import type { popover } from './const'
import type { HTMLAttributes, ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'

/** ポップオーバーの表示位置 */
export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'

/** ポップオーバーの揃え位置 */
export type PopoverAlign = 'start' | 'center' | 'end'

export interface PopoverProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content'>, VariantProps<typeof popover> {
  /** ポップオーバーの内容（リッチコンテンツ対応） */
  content: ReactNode
  /** 表示位置 @default 'bottom' */
  placement?: PopoverPlacement
  /** 揃え位置 @default 'center' */
  align?: PopoverAlign
  /** 矢印を表示するか @default false */
  arrow?: boolean
  /** トリガー要素からの距離（px） */
  offset?: number
  /** ポップオーバーを無効にするか @default false */
  disabled?: boolean
  /** 制御モード：開閉状態 */
  open?: boolean
  /** 制御モード：開閉状態変更コールバック */
  onOpenChange?: (open: boolean) => void
  /** カスタムクラス（ポップオーバー本体に適用） */
  className?: string
  /** トリガー要素 */
  children: ReactNode
}
