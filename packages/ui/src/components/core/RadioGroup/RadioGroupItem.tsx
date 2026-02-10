import { forwardRef, useContext, useId } from 'react'
import { cn } from '../../../lib/utils'
import { radioGroupItem } from './const'
import { RadioGroupContext } from './context'
import type { RadioGroupItemProps } from './type'

export const RadioGroupItem = forwardRef<HTMLLabelElement, RadioGroupItemProps>(
  ({ value, children, disabled = false, className, ...props }, ref) => {
    const context = useContext(RadioGroupContext)
    const itemId = useId()

    if (!context) {
      throw new Error('RadioGroupItem must be used within a RadioGroup')
    }

    const isDisabled = disabled || context.disabled
    const isChecked = context.value === value

    const styles = radioGroupItem({
      size: context.size,
      checked: isChecked,
      disabled: isDisabled,
    })

    const handleChange = () => {
      if (isDisabled) return
      context.setValue(value)
    }

    return (
      <label ref={ref} className={cn(styles.wrapper(), className)} {...props}>
        <input
          type="radio"
          id={itemId}
          name={context.name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          required={context.required}
          onChange={handleChange}
          className={styles.input()}
          aria-checked={isChecked}
        />
        <span className={styles.indicator()} aria-hidden="true">
          <span className={styles.dot()} />
        </span>
        {children && <span className={styles.label()}>{children}</span>}
      </label>
    )
  }
)

RadioGroupItem.displayName = 'RadioGroupItem'
