import type { checkbox } from './const'
import type { InputHTMLAttributes } from 'react'
import type { VariantProps } from 'tailwind-variants'

export interface CheckboxProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkbox> {
  /** チェック状態 */
  checked?: boolean
  /** チェック状態変更ハンドラ */
  onCheckedChange?: (checked: boolean) => void
  /** 無効状態 @default false */
  disabled?: boolean
  /** サイズ @default 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** ラベルテキスト */
  label?: string
  /** カスタムクラス（ルート要素に適用） */
  className?: string
}
