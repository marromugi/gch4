import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/utils'
import { textArea } from './const'
import type { TextAreaProps } from './type'

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      error = false,
      disabled = false,
      size = 'md',
      rows = 4,
      resize = 'vertical',
      className,
      id,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId

    const hasError = Boolean(error)

    return (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={cn(textArea({ size, error: hasError, disabled, resize }), className)}
        aria-invalid={ariaInvalid ?? hasError}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    )
  }
)

TextArea.displayName = 'TextArea'
