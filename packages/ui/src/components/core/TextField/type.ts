import type { textField } from './const'
import type { InputHTMLAttributes } from 'react'
import type { VariantProps } from 'tailwind-variants'

export interface TextFieldProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof textField>, 'error'> {
  /** エラー状態（trueまたはエラーメッセージ文字列） */
  error?: boolean | string
  /** 無効状態 @default false */
  disabled?: boolean
  /** サイズ @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** カスタムクラス（input要素に適用） */
  className?: string
}
