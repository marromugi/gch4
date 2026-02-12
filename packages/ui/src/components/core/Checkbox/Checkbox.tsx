import { forwardRef, useId } from 'react'
import { cn } from '../../../lib/utils'
import { checkbox } from './const'
import type { CheckboxProps } from './type'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onCheckedChange,
      disabled = false,
      size = 'md',
      label,
      className,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const styles = checkbox({ size, disabled })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <div className={cn(styles.wrapper(), className)}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className={styles.input()}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className={styles.label()}>
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
