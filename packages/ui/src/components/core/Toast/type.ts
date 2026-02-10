import type { ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'
import type { toast } from './const'

/** Toastの種類 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'

/** Toastの表示位置 */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

/** 単一Toastのデータ */
export interface ToastData {
  /** 一意のID */
  id: string
  /** Toastの種類 @default 'default' */
  type?: ToastType
  /** タイトル（メインテキスト） */
  title: ReactNode
  /** メッセージ（サブテキスト、オプション） */
  message?: ReactNode
  /** 表示時間（ms）。0で自動消去しない @default 5000 */
  duration?: number
  /** 閉じるボタンを表示するか @default true */
  closable?: boolean
  /** アイコンを表示するか @default true */
  showIcon?: boolean
  /** カスタムアイコン */
  icon?: ReactNode
  /** 閉じたときのコールバック */
  onClose?: () => void
}

/** Toast追加時のオプション */
export type ToastOptions = Omit<ToastData, 'id'>

/** ToastProviderのProps */
export interface ToastProviderProps {
  children: ReactNode
  /** デフォルトの表示位置 @default 'top-right' */
  position?: ToastPosition
  /** Toast間の間隔（px） @default 12 */
  gap?: number
  /** デフォルトの表示時間（ms） @default 5000 */
  defaultDuration?: number
  /** 最大表示数。超過時は古いものから削除 @default 5 */
  maxToasts?: number
}

/** ToastContainerのProps */
export interface ToastContainerProps extends VariantProps<typeof toast> {
  /** 表示位置 */
  position: ToastPosition
  /** Toast一覧 */
  toasts: ToastData[]
  /** Toastを閉じる関数 */
  onClose: (id: string) => void
  /** Toast間の間隔 */
  gap: number
}

/** 単一ToastのProps */
export interface ToastProps extends VariantProps<typeof toast> {
  /** Toastデータ */
  data: ToastData
  /** 閉じる処理 */
  onClose: () => void
  /** 表示位置（アニメーション用） */
  position: ToastPosition
}

/** useToastの戻り値 */
export interface UseToastReturn {
  /** Toast一覧 */
  toasts: ToastData[]
  /** Toastを追加 */
  addToast: (options: ToastOptions) => string
  /** Toastを削除 */
  removeToast: (id: string) => void
  /** 全Toastを削除 */
  clearToasts: () => void
  /** 成功Toastを表示 */
  success: (title: ReactNode, options?: Partial<ToastOptions>) => string
  /** エラーToastを表示 */
  error: (title: ReactNode, options?: Partial<ToastOptions>) => string
  /** 警告Toastを表示 */
  warning: (title: ReactNode, options?: Partial<ToastOptions>) => string
  /** 情報Toastを表示 */
  info: (title: ReactNode, options?: Partial<ToastOptions>) => string
}

/** ToastContextの値 */
export interface ToastContextValue extends UseToastReturn {
  /** 設定 */
  config: {
    position: ToastPosition
    gap: number
    defaultDuration: number
    maxToasts: number
  }
}
