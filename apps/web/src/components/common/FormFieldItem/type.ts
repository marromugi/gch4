import type { Control, FieldValues } from '@/lib/hook-form'

export interface FormFieldItemRowProps<T extends FieldValues> {
  index: number
  control: Control<T>
  fieldArrayName: string
  onRemove: () => void
  canRemove: boolean
  placeholders?: {
    label?: string
    intent?: string
    intentDescription?: string
  }
}
