export interface Option {
  id: string
  label: string
}

export interface OptionsSelectorProps {
  options: Option[]
  selectionType: 'radio' | 'checkbox'
  onSubmit: (selectedIds: string[], freeText?: string) => void
  disabled?: boolean
}

export interface OptionItemProps {
  option: Option
  isSelected: boolean
  selectionType: 'radio' | 'checkbox'
  onToggle: () => void
  disabled?: boolean
}
