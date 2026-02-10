import type { icon } from './const'
import type { ComponentType, SVGProps } from 'react'
import type { VariantProps } from 'tailwind-variants'

/**
 * SVGアイコンコンポーネントの型
 */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>, VariantProps<typeof icon> {
  /**
   * 表示するアイコンコンポーネント
   */
  icon: IconComponent
  /**
   * アイコンのサイズ
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * アイコンのカラーバリアント
   * @default 'body'
   */
  variant?: 'body' | 'description' | 'alert' | 'disabled' | 'fill'
  /**
   * 追加のCSSクラス
   */
  className?: string
}
