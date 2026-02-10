import type { menu, menuItem } from './const'
import type { IconComponent } from '../Icon/type'
import type { HTMLAttributes, ReactNode, MouseEvent } from 'react'
import type { VariantProps } from 'tailwind-variants'

/** メニューの表示位置 */
export type MenuPlacement = 'top' | 'bottom' | 'left' | 'right'

/** メニューの揃え位置 */
export type MenuAlign = 'start' | 'center' | 'end'

export interface MenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content'>, VariantProps<typeof menu> {
  /** メニューの内容（MenuItem, MenuSub, MenuDivider を受け取る） */
  children: ReactNode
  /** 表示位置 @default 'bottom' */
  placement?: MenuPlacement
  /** 揃え位置 @default 'start' */
  align?: MenuAlign
  /** トリガー要素からの距離（px） @default 4 */
  offset?: number
  /** メニューを無効にするか @default false */
  disabled?: boolean
  /** 制御モード：開閉状態 */
  open?: boolean
  /** 制御モード：開閉状態変更コールバック */
  onOpenChange?: (open: boolean) => void
  /** メニューの最小幅（px） @default 200 */
  minWidth?: number
  /** トリガー要素 */
  trigger: ReactNode
  /** カスタムクラス（メニューコンテナに適用） */
  className?: string
}

export interface MenuItemProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'>, VariantProps<typeof menuItem> {
  /** メニューアイテムのラベル */
  children: ReactNode
  /** 左側に表示するアイコン */
  icon?: IconComponent
  /** 右側に表示するアイコン */
  endIcon?: IconComponent
  /** クリック時のコールバック */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  /** 無効状態 @default false */
  disabled?: boolean
  /** 破壊的なアクションを示す（赤色表示） @default false */
  destructive?: boolean
  /** キーボードショートカット表示（例: "⌘K"） */
  shortcut?: string
  /** カスタムクラス */
  className?: string
}

export interface MenuSubProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** サブメニューのラベル */
  label: ReactNode
  /** 左側に表示するアイコン */
  icon?: IconComponent
  /** サブメニューの内容 */
  children: ReactNode
  /** 無効状態 @default false */
  disabled?: boolean
  /** カスタムクラス */
  className?: string
}

export interface MenuDividerProps extends HTMLAttributes<HTMLHRElement> {
  /** カスタムクラス */
  className?: string
}

export interface MenuContextValue {
  /** メニューを閉じる */
  handleClose: () => void
  /** アイテム選択時のハンドラ（コールバック実行後にメニューを閉じる） */
  handleSelect: (callback?: () => void) => () => void
}
