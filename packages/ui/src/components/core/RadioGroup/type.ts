import type { radioGroup, radioGroupItem } from './const'
import type { HTMLAttributes, ReactNode } from 'react'
import type { VariantProps } from 'tailwind-variants'

/** RadioGroup のサイズ */
export type RadioGroupSize = 'sm' | 'md'

/** RadioGroup の方向 */
export type RadioGroupOrientation = 'horizontal' | 'vertical'

export interface RadioGroupProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof radioGroup> {
  /** ラジオグループの内容（RadioGroupItem を受け取る） */
  children: ReactNode
  /** 選択されている値（制御モード） */
  value?: string
  /** デフォルト値（非制御モード） */
  defaultValue?: string
  /** 値変更時のコールバック */
  onValueChange?: (value: string) => void
  /** グループ全体を無効にする @default false */
  disabled?: boolean
  /** サイズ @default 'md' */
  size?: RadioGroupSize
  /** 配置方向 @default 'vertical' */
  orientation?: RadioGroupOrientation
  /** フォーム送信時の name 属性 */
  name?: string
  /** 必須フィールドか @default false */
  required?: boolean
  /** カスタムクラス */
  className?: string
}

export interface RadioGroupItemProps
  extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'>, VariantProps<typeof radioGroupItem> {
  /** ラジオボタンの値（必須） */
  value: string
  /** ラベル（オプション） */
  children?: ReactNode
  /** 個別に無効にする @default false */
  disabled?: boolean
  /** カスタムクラス */
  className?: string
}

export interface RadioGroupContextValue {
  /** 現在選択されている値 */
  value: string | undefined
  /** 値を変更する */
  setValue: (value: string) => void
  /** グループ全体の無効状態 */
  disabled: boolean
  /** サイズ */
  size: RadioGroupSize
  /** フォームの name 属性 */
  name: string
  /** 必須フィールドか */
  required: boolean
}
