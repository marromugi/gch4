import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

// テーブルのバリアント
export type TableVariant = 'default' | 'striped'
export type TableSize = 'sm' | 'md' | 'lg'

// Table
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** テーブルのバリアント @default 'default' */
  variant?: TableVariant
  /** テーブルのサイズ @default 'md' */
  size?: TableSize
  /** カスタムクラス */
  className?: string
}

// TableHeader
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** カスタムクラス */
  className?: string
}

// TableBody
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** カスタムクラス */
  className?: string
}

// TableFooter
export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** カスタムクラス */
  className?: string
}

// TableRow
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** 選択状態 */
  selected?: boolean
  /** カスタムクラス */
  className?: string
}

// TableHead（<th>）
export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** カスタムクラス */
  className?: string
}

// TableCell（<td>）
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** カスタムクラス */
  className?: string
}

// TableCaption
export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  /** カスタムクラス */
  className?: string
}

// Context
export interface TableContextValue {
  /** テーブルのバリアント */
  variant: TableVariant
  /** テーブルのサイズ */
  size: TableSize
}
