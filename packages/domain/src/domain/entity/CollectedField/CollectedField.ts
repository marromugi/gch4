import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { CollectedFieldId } from '../../valueObject/CollectedFieldId/CollectedFieldId'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import type { FormFieldId } from '../../valueObject/FormFieldId/FormFieldId'
import type { CollectedFieldSource } from '../../valueObject/CollectedFieldSource/CollectedFieldSource'

export interface CollectedFieldProps {
  id: CollectedFieldId
  submissionId: SubmissionId
  formFieldId: FormFieldId
  value: string
  source: CollectedFieldSource
  confirmed: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 収集フィールドエンティティ（Submission集約の子）
 */
export class CollectedField implements TimestampedEntity<CollectedFieldId> {
  private constructor(private readonly props: CollectedFieldProps) {}

  get id(): CollectedFieldId {
    return this.props.id
  }

  get submissionId(): SubmissionId {
    return this.props.submissionId
  }

  get formFieldId(): FormFieldId {
    return this.props.formFieldId
  }

  get value(): string {
    return this.props.value
  }

  get source(): CollectedFieldSource {
    return this.props.source
  }

  get confirmed(): boolean {
    return this.props.confirmed
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: CollectedFieldProps): CollectedField {
    return new CollectedField(props)
  }

  static reconstruct(props: CollectedFieldProps): CollectedField {
    return new CollectedField(props)
  }

  confirm(): CollectedField {
    return new CollectedField({
      ...this.props,
      confirmed: true,
      updatedAt: new Date(),
    })
  }

  updateValue(value: string, source: CollectedFieldSource): CollectedField {
    return new CollectedField({
      ...this.props,
      value,
      source,
      confirmed: false,
      updatedAt: new Date(),
    })
  }

  equals(other: CollectedField): boolean {
    return this.props.id.equals(other.props.id)
  }
}
