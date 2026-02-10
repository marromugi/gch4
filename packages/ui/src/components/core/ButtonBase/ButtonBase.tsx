import { forwardRef } from 'react'
import { cn } from '../../../lib/utils'
import { buttonBase, buttonIconGap, buttonIconSize } from './const'
import type { ButtonBaseProps } from './type'

export const ButtonBase = forwardRef<HTMLSpanElement, ButtonBaseProps>(
  (
    {
      children,
      className,
      variant,
      size = 'md',
      fullWidth,
      isLoading = false,
      disabled = false,
      icon: IconComponent,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    const iconElement = IconComponent && (
      <IconComponent className={cn(buttonIconSize[size], 'shrink-0')} aria-hidden="true" />
    )

    const hasGap = IconComponent && children
    const gapClass = hasGap ? buttonIconGap[size] : ''

    return (
      <span
        ref={ref}
        className={cn(
          buttonBase({ variant, size, fullWidth, isLoading, disabled }),
          gapClass,
          className
        )}
        data-loading={isLoading || undefined}
        data-disabled={disabled || undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          <>
            {iconPosition === 'left' && iconElement}
            {children}
            {iconPosition === 'right' && iconElement}
          </>
        )}
      </span>
    )
  }
)
