import type { textArea } from './const'
import type { TextareaHTMLAttributes } from 'react'
import type { VariantProps } from 'tailwind-variants'

export interface TextAreaProps
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    Omit<VariantProps<typeof textArea>, 'error'> {
  /** エラー状態（trueまたはエラーメッセージ文字列） */
  error?: boolean | string
  /** 無効状態 @default false */
  disabled?: boolean
  /** サイズ @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** 行数 @default 4 */
  rows?: number
  /** リサイズ方向 @default 'vertical' */
  resize?: 'none' | 'vertical' | 'both'
  /** カスタムクラス（textarea要素に適用） */
  className?: string
}
