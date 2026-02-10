import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { ExtractedFieldId } from '../../valueObject/ExtractedFieldId/ExtractedFieldId'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import type { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import type { ExtractedFieldSource } from '../../valueObject/ExtractedFieldSource/ExtractedFieldSource'

export interface ExtractedFieldProps {
  id: ExtractedFieldId
  applicationId: ApplicationId
  jobFormFieldId: JobFormFieldId
  value: string
  source: ExtractedFieldSource
  confirmed: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 抽出フィールドエンティティ（Application集約の子）
 */
export class ExtractedField implements TimestampedEntity<ExtractedFieldId> {
  private constructor(private readonly props: ExtractedFieldProps) {}

  get id(): ExtractedFieldId {
    return this.props.id
  }

  get applicationId(): ApplicationId {
    return this.props.applicationId
  }

  get jobFormFieldId(): JobFormFieldId {
    return this.props.jobFormFieldId
  }

  get value(): string {
    return this.props.value
  }

  get source(): ExtractedFieldSource {
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

  static create(props: ExtractedFieldProps): ExtractedField {
    return new ExtractedField(props)
  }

  static reconstruct(props: ExtractedFieldProps): ExtractedField {
    return new ExtractedField(props)
  }

  confirm(): ExtractedField {
    return new ExtractedField({
      ...this.props,
      confirmed: true,
      updatedAt: new Date(),
    })
  }

  updateValue(value: string, source: ExtractedFieldSource): ExtractedField {
    return new ExtractedField({
      ...this.props,
      value,
      source,
      confirmed: false,
      updatedAt: new Date(),
    })
  }

  equals(other: ExtractedField): boolean {
    return this.props.id.equals(other.props.id)
  }
}
