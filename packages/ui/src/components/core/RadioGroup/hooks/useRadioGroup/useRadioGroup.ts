import { useCallback, useId, useState } from 'react'
import type { UseRadioGroupParams, UseRadioGroupReturn } from './type'

export const useRadioGroup = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled,
}: UseRadioGroupParams): UseRadioGroupReturn => {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const groupId = useId()

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const setValue = useCallback(
    (nextValue: string) => {
      if (disabled) return

      if (!isControlled) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
    },
    [disabled, isControlled, onValueChange]
  )

  return {
    currentValue,
    setValue,
    groupId,
  }
}
