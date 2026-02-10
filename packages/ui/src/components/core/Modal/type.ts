import type { modal } from './const'
import type { HTMLAttributes, ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'

/** モーダルのサイズ */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps extends VariantProps<typeof modal> {
  /** モーダルの内容 */
  children: ReactNode
  /** モーダルのサイズ @default 'md' */
  size?: ModalSize
  /** 制御モード：開閉状態 */
  open: boolean
  /** 制御モード：開閉状態変更コールバック */
  onOpenChange: (open: boolean) => void
  /** オーバーレイクリックで閉じるか @default true */
  closeOnOverlayClick?: boolean
  /** Escapeキーで閉じるか @default true */
  closeOnEscape?: boolean
  /** 閉じるボタンを表示するか @default true */
  showCloseButton?: boolean
  /** カスタムクラス（モーダルコンテンツに適用） */
  className?: string
  /** モーダルのタイトル（aria-labelledby 用） */
  title?: string
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** ヘッダーの内容（タイトルなど） */
  children: ReactNode
  /** カスタムクラス */
  className?: string
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** ボディの内容 */
  children: ReactNode
  /** カスタムクラス */
  className?: string
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** フッターの内容（ボタンなど） */
  children: ReactNode
  /** カスタムクラス */
  className?: string
}

export interface ModalContextValue {
  /** モーダルを閉じる */
  handleClose: () => void
  /** モーダルID（ARIA用） */
  modalId: string
  /** タイトルID（aria-labelledby用） */
  titleId: string
}
