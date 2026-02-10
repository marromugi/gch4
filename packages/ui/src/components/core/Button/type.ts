import type { IconComponent } from '../Icon/type'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'alert'
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'icon'
  fullWidth?: boolean
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
