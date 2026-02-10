import type { IconComponent } from '../Icon/type'
import type { HTMLAttributes, ReactNode } from 'react'

export interface ButtonBaseProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'alert' | 'primary-ghost' | 'alert-ghost'
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'icon'
  fullWidth?: boolean
  isLoading?: boolean
  disabled?: boolean
  className?: string
  /**
   * 表示するアイコンコンポーネント
   */
  icon?: IconComponent
  /**
   * アイコンの位置
   * @default 'left'
   */
  iconPosition?: 'left' | 'right'
}
