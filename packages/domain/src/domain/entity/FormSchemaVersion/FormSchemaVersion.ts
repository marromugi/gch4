import type { Entity } from '../../shared/Entity/Entity'
import type { FormSchemaVersionId } from '../../valueObject/FormSchemaVersionId/FormSchemaVersionId'
import type { FormId } from '../../valueObject/FormId/FormId'
import { FormSchemaVersionStatus } from '../../valueObject/FormSchemaVersionStatus/FormSchemaVersionStatus'

export interface FormSchemaVersionProps {
  id: FormSchemaVersionId
  formId: FormId
  version: number
  status: FormSchemaVersionStatus
  approvedAt: Date | null
  createdAt: Date
}

/**
 * フォームスキーマバージョンエンティティ（Form集約の子）
 */
export class FormSchemaVersion implements Entity<FormSchemaVersionId> {
  private constructor(private readonly props: FormSchemaVersionProps) {}

  get id(): FormSchemaVersionId {
    return this.props.id
  }

  get formId(): FormId {
    return this.props.formId
  }

  get version(): number {
    return this.props.version
  }

  get status(): FormSchemaVersionStatus {
    return this.props.status
  }

  get approvedAt(): Date | null {
    return this.props.approvedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: FormSchemaVersionProps): FormSchemaVersion {
    if (props.version < 1) {
      throw new Error('FormSchemaVersion version must be positive')
    }
    return new FormSchemaVersion(props)
  }

  static reconstruct(props: FormSchemaVersionProps): FormSchemaVersion {
    return new FormSchemaVersion(props)
  }

  /**
   * スキーマバージョンを承認する（draft -> approved）
   */
  approve(): FormSchemaVersion {
    if (!this.props.status.canTransitionTo(FormSchemaVersionStatus.approved())) {
      throw new Error(`Cannot approve schema version in status: ${this.props.status.value}`)
    }
    return new FormSchemaVersion({
      ...this.props,
      status: FormSchemaVersionStatus.approved(),
      approvedAt: new Date(),
    })
  }

  equals(other: FormSchemaVersion): boolean {
    return this.props.id.equals(other.props.id)
  }
}
