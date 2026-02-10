import type { Entity } from '../../shared/Entity/Entity'
import type { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import type { JobId } from '../../valueObject/JobId/JobId'
import { JobSchemaVersionStatus } from '../../valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'

export interface JobSchemaVersionProps {
  id: JobSchemaVersionId
  jobId: JobId
  version: number
  status: JobSchemaVersionStatus
  approvedAt: Date | null
  createdAt: Date
}

/**
 * 求人スキーマバージョンエンティティ（Job集約の子）
 */
export class JobSchemaVersion implements Entity<JobSchemaVersionId> {
  private constructor(private readonly props: JobSchemaVersionProps) {}

  get id(): JobSchemaVersionId {
    return this.props.id
  }

  get jobId(): JobId {
    return this.props.jobId
  }

  get version(): number {
    return this.props.version
  }

  get status(): JobSchemaVersionStatus {
    return this.props.status
  }

  get approvedAt(): Date | null {
    return this.props.approvedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: JobSchemaVersionProps): JobSchemaVersion {
    if (props.version < 1) {
      throw new Error('JobSchemaVersion version must be positive')
    }
    return new JobSchemaVersion(props)
  }

  static reconstruct(props: JobSchemaVersionProps): JobSchemaVersion {
    return new JobSchemaVersion(props)
  }

  /**
   * スキーマバージョンを承認する（draft -> approved）
   */
  approve(): JobSchemaVersion {
    if (!this.props.status.canTransitionTo(JobSchemaVersionStatus.approved())) {
      throw new Error(`Cannot approve schema version in status: ${this.props.status.value}`)
    }
    return new JobSchemaVersion({
      ...this.props,
      status: JobSchemaVersionStatus.approved(),
      approvedAt: new Date(),
    })
  }

  equals(other: JobSchemaVersion): boolean {
    return this.props.id.equals(other.props.id)
  }
}
