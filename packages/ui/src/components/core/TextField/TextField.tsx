import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/utils'
import { textField } from './const'
import type { TextFieldProps } from './type'

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      error = false,
      disabled = false,
      size = 'md',
      className,
      id,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    // error が boolean か string かを判定
    const hasError = Boolean(error)

    return (
      <input
        ref={ref}
        id={inputId}
        type="text"
        disabled={disabled}
        className={cn(textField({ size, error: hasError, disabled }), className)}
        aria-invalid={ariaInvalid ?? hasError}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    )
  }
)

TextField.displayName = 'TextField'
