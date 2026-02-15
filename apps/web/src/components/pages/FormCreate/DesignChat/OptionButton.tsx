import { optionButton } from './const'
import type { OptionButtonProps } from './type'

export function OptionButton({
  option,
  isSelected,
  selectionType,
  onToggle,
  disabled,
}: OptionButtonProps) {
  const styles = optionButton({ selected: isSelected, selectionType, disabled })

  return (
    <button type="button" className={styles.button()} onClick={onToggle} disabled={disabled}>
      <span className={styles.indicator()}>
        <span className={styles.indicatorInner()} />
      </span>
      <span className={styles.label()}>{option.label}</span>
    </button>
  )
}
