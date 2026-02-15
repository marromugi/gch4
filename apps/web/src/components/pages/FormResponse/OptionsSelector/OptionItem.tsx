import { optionItem } from './const'
import type { OptionItemProps } from './type'

export function OptionItem({
  option,
  isSelected,
  selectionType,
  onToggle,
  disabled,
}: OptionItemProps) {
  const styles = optionItem({ selected: isSelected, selectionType, disabled })

  return (
    <button type="button" className={styles.button()} onClick={onToggle} disabled={disabled}>
      <span className={styles.indicator()}>
        <span className={styles.indicatorInner()} />
      </span>
      <span className={styles.label()}>{option.label}</span>
    </button>
  )
}
