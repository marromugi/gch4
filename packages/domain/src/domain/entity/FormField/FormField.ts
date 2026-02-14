import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { FormFieldId } from '../../valueObject/FormFieldId/FormFieldId'
import type { FormId } from '../../valueObject/FormId/FormId'

export interface FormFieldProps {
  id: FormFieldId
  formId: FormId
  fieldId: string
  label: string
  /** フィールドの説明 */
  description: string | null
  /** 深掘り観点 */
  intent: string | null
  required: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

/**
 * フォームフィールドエンティティ（Form集約の子）
 */
export class FormField implements TimestampedEntity<FormFieldId> {
  private constructor(private readonly props: FormFieldProps) {}

  get id(): FormFieldId {
    return this.props.id
  }

  get formId(): FormId {
    return this.props.formId
  }

  get fieldId(): string {
    return this.props.fieldId
  }

  get label(): string {
    return this.props.label
  }

  get description(): string | null {
    return this.props.description
  }

  get intent(): string | null {
    return this.props.intent
  }

  get required(): boolean {
    return this.props.required
  }

  get sortOrder(): number {
    return this.props.sortOrder
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: FormFieldProps): FormField {
    if (!props.label || props.label.trim().length === 0) {
      throw new Error('FormField label cannot be empty')
    }
    if (!props.fieldId || props.fieldId.trim().length === 0) {
      throw new Error('FormField fieldId cannot be empty')
    }
    if (props.sortOrder < 0) {
      throw new Error('FormField sortOrder must be non-negative')
    }
    return new FormField(props)
  }

  static reconstruct(props: FormFieldProps): FormField {
    return new FormField(props)
  }

  equals(other: FormField): boolean {
    return this.props.id.equals(other.props.id)
  }
}
