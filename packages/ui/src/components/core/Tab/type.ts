import type { tab } from './const'
import type { HTMLAttributes, ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'

/** 個々のタブアイテム */
export interface TabItem {
  /** タブの一意な値 */
  value: string
  /** タブに表示するラベル */
  label: ReactNode
}

export interface TabProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>, VariantProps<typeof tab> {
  /** タブアイテムの配列 */
  items: TabItem[]
  /** 現在選択されているタブの value */
  value: string
  /** タブ変更時のコールバック */
  onChange: (value: string) => void
  /** 各タブの最小幅（px） */
  minWidth?: number
  /** カスタムクラス（ルート要素に適用） */
  className?: string
}
