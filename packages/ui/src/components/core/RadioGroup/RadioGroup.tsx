import { forwardRef } from 'react'
import { cn } from '../../../lib/utils'
import { radioGroup } from './const'
import { RadioGroupContext } from './context'
import { useRadioGroup } from './hooks/useRadioGroup/useRadioGroup'
import type { RadioGroupProps } from './type'

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      children,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      size = 'md',
      orientation = 'vertical',
      name,
      required = false,
      className,
      ...props
    },
    ref
  ) => {
    const { currentValue, setValue, groupId } = useRadioGroup({
      value,
      defaultValue,
      onValueChange,
      disabled,
    })

    const styles = radioGroup({ orientation, disabled })

    return (
      <RadioGroupContext.Provider
        value={{
          value: currentValue,
          setValue,
          disabled,
          size,
          name: name ?? groupId,
          required,
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          aria-disabled={disabled || undefined}
          aria-required={required || undefined}
          className={cn(styles, className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
