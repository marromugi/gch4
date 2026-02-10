import { forwardRef } from 'react'
import { cn } from '../../../lib'
import { ButtonBase } from '../ButtonBase/ButtonBase'
import { button } from './const'
import type { ButtonProps } from './type'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant, size, fullWidth, className, disabled, icon, iconPosition, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        data-variant={variant}
        className={cn(
          'group',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variant === 'primary' &&
            'focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300',
          variant === 'secondary' &&
            'focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600',
          variant === 'alert' && 'focus-visible:ring-red-600',
          'disabled:pointer-events-none disabled:opacity-50',
          button({ variant }),
          className
        )}
        disabled={disabled}
        {...props}
      >
        <ButtonBase
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          icon={icon}
          iconPosition={iconPosition}
        >
          {children}
        </ButtonBase>
      </button>
    )
  }
)
