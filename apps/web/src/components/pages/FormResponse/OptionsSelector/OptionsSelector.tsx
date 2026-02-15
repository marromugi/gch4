import { useState } from 'react'
import { optionsSelector } from './const'
import { OptionItem } from './OptionItem'
import type { OptionsSelectorProps } from './type'

export function OptionsSelector({
  options,
  selectionType,
  onSubmit,
  disabled,
}: OptionsSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const styles = optionsSelector()

  const handleToggle = (optionId: string) => {
    if (selectionType === 'radio') {
      setSelectedIds([optionId])
    } else {
      setSelectedIds((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      )
    }
  }

  const handleSubmit = () => {
    onSubmit(selectedIds, freeText || undefined)
  }

  const canSubmit = selectedIds.length > 0 || freeText.trim()

  return (
    <div>
      <div className={styles.container()}>
        {options.map((option) => (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={selectedIds.includes(option.id)}
            selectionType={selectionType}
            onToggle={() => handleToggle(option.id)}
            disabled={disabled}
          />
        ))}
      </div>

      <div className={styles.freeTextContainer()}>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="その他（自由入力）"
          disabled={disabled}
          className={styles.freeTextInput()}
          rows={2}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || disabled}
        className={styles.submitButton()}
      >
        回答を送信
      </button>
    </div>
  )
}
