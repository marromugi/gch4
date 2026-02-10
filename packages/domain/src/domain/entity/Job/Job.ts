import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { UserId } from '../../valueObject/UserId/UserId'
import { JobStatus } from '../../valueObject/JobStatus/JobStatus'

export interface JobProps {
  id: JobId
  title: string
  description: string | null
  idealCandidate: string | null
  cultureContext: string | null
  status: JobStatus
  createdBy: UserId
  createdAt: Date
  updatedAt: Date
}

/**
 * 求人エンティティ（Job集約ルート）
 */
export class Job implements TimestampedEntity<JobId> {
  private constructor(private readonly props: JobProps) {}

  get id(): JobId {
    return this.props.id
  }

  get title(): string {
    return this.props.title
  }

  get description(): string | null {
    return this.props.description
  }

  get idealCandidate(): string | null {
    return this.props.idealCandidate
  }

  get cultureContext(): string | null {
    return this.props.cultureContext
  }

  get status(): JobStatus {
    return this.props.status
  }

  get createdBy(): UserId {
    return this.props.createdBy
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: JobProps): Job {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Job title cannot be empty')
    }
    return new Job(props)
  }

  static reconstruct(props: JobProps): Job {
    return new Job(props)
  }

  /**
   * 求人を公開する（draft -> open）
   * SchemaVersionがapprovedであることは呼び出し側で保証する
   */
  publish(): Job {
    if (!this.props.status.canTransitionTo(JobStatus.open())) {
      throw new Error(`Cannot publish job in status: ${this.props.status.value}`)
    }
    return new Job({
      ...this.props,
      status: JobStatus.open(),
      updatedAt: new Date(),
    })
  }

  /**
   * 求人を閉じる（open -> closed）
   */
  close(): Job {
    if (!this.props.status.canTransitionTo(JobStatus.closed())) {
      throw new Error(`Cannot close job in status: ${this.props.status.value}`)
    }
    return new Job({
      ...this.props,
      status: JobStatus.closed(),
      updatedAt: new Date(),
    })
  }

  equals(other: Job): boolean {
    return this.props.id.equals(other.props.id)
  }
}
