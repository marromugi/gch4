import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { UserId } from '../../valueObject/UserId/UserId'
import { ReviewPolicyVersionStatus } from '../../valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'

export interface ReviewPolicyVersionProps {
  id: ReviewPolicyVersionId
  jobId: JobId
  version: number
  status: ReviewPolicyVersionStatus
  softCap: number
  hardCap: number
  createdBy: UserId
  confirmedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * レビュー方針バージョンエンティティ（ReviewPolicy集約ルート）
 */
export class ReviewPolicyVersion implements TimestampedEntity<ReviewPolicyVersionId> {
  private constructor(private readonly props: ReviewPolicyVersionProps) {}

  get id(): ReviewPolicyVersionId {
    return this.props.id
  }

  get jobId(): JobId {
    return this.props.jobId
  }

  get version(): number {
    return this.props.version
  }

  get status(): ReviewPolicyVersionStatus {
    return this.props.status
  }

  get softCap(): number {
    return this.props.softCap
  }

  get hardCap(): number {
    return this.props.hardCap
  }

  get createdBy(): UserId {
    return this.props.createdBy
  }

  get confirmedAt(): Date | null {
    return this.props.confirmedAt
  }

  get publishedAt(): Date | null {
    return this.props.publishedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: ReviewPolicyVersionProps): ReviewPolicyVersion {
    if (props.softCap >= props.hardCap) {
      throw new Error('softCap must be less than hardCap')
    }
    if (props.version < 1) {
      throw new Error('ReviewPolicyVersion version must be positive')
    }
    return new ReviewPolicyVersion(props)
  }

  static reconstruct(props: ReviewPolicyVersionProps): ReviewPolicyVersion {
    return new ReviewPolicyVersion(props)
  }

  confirm(): ReviewPolicyVersion {
    if (!this.props.status.canTransitionTo(ReviewPolicyVersionStatus.confirmed())) {
      throw new Error(`Cannot confirm policy in status: ${this.props.status.value}`)
    }
    return new ReviewPolicyVersion({
      ...this.props,
      status: ReviewPolicyVersionStatus.confirmed(),
      confirmedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  publish(): ReviewPolicyVersion {
    if (!this.props.status.canTransitionTo(ReviewPolicyVersionStatus.published())) {
      throw new Error(`Cannot publish policy in status: ${this.props.status.value}`)
    }
    return new ReviewPolicyVersion({
      ...this.props,
      status: ReviewPolicyVersionStatus.published(),
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  equals(other: ReviewPolicyVersion): boolean {
    return this.props.id.equals(other.props.id)
  }
}
