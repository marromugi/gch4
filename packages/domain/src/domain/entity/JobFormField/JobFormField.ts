import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import type { JobId } from '../../valueObject/JobId/JobId'

export interface JobFormFieldProps {
  id: JobFormFieldId
  jobId: JobId
  fieldId: string
  label: string
  intent: string | null
  required: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 求人フォーム項目エンティティ（Job集約の子）
 */
export class JobFormField implements TimestampedEntity<JobFormFieldId> {
  private constructor(private readonly props: JobFormFieldProps) {}

  get id(): JobFormFieldId {
    return this.props.id
  }

  get jobId(): JobId {
    return this.props.jobId
  }

  get fieldId(): string {
    return this.props.fieldId
  }

  get label(): string {
    return this.props.label
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

  static create(props: JobFormFieldProps): JobFormField {
    if (!props.label || props.label.trim().length === 0) {
      throw new Error('JobFormField label cannot be empty')
    }
    if (!props.fieldId || props.fieldId.trim().length === 0) {
      throw new Error('JobFormField fieldId cannot be empty')
    }
    if (props.sortOrder < 0) {
      throw new Error('JobFormField sortOrder must be non-negative')
    }
    return new JobFormField(props)
  }

  static reconstruct(props: JobFormFieldProps): JobFormField {
    return new JobFormField(props)
  }

  equals(other: JobFormField): boolean {
    return this.props.id.equals(other.props.id)
  }
}
