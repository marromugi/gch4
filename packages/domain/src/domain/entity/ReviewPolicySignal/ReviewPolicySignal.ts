import type { Entity } from '../../shared/Entity/Entity'
import type { ReviewPolicySignalId } from '../../valueObject/ReviewPolicySignalId/ReviewPolicySignalId'
import type { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { ReviewSignalPriority } from '../../valueObject/ReviewSignalPriority/ReviewSignalPriority'
import type { ReviewSignalCategory } from '../../valueObject/ReviewSignalCategory/ReviewSignalCategory'

export interface ReviewPolicySignalProps {
  id: ReviewPolicySignalId
  policyVersionId: ReviewPolicyVersionId
  signalKey: string
  label: string
  description: string | null
  priority: ReviewSignalPriority
  category: ReviewSignalCategory
  sortOrder: number
  createdAt: Date
}

/**
 * レビューシグナルエンティティ（ReviewPolicyVersionの子）
 */
export class ReviewPolicySignal implements Entity<ReviewPolicySignalId> {
  private constructor(private readonly props: ReviewPolicySignalProps) {}

  get id(): ReviewPolicySignalId {
    return this.props.id
  }

  get policyVersionId(): ReviewPolicyVersionId {
    return this.props.policyVersionId
  }

  get signalKey(): string {
    return this.props.signalKey
  }

  get label(): string {
    return this.props.label
  }

  get description(): string | null {
    return this.props.description
  }

  get priority(): ReviewSignalPriority {
    return this.props.priority
  }

  get category(): ReviewSignalCategory {
    return this.props.category
  }

  get sortOrder(): number {
    return this.props.sortOrder
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: ReviewPolicySignalProps): ReviewPolicySignal {
    if (!props.signalKey || props.signalKey.trim().length === 0) {
      throw new Error('ReviewPolicySignal signalKey cannot be empty')
    }
    if (!props.label || props.label.trim().length === 0) {
      throw new Error('ReviewPolicySignal label cannot be empty')
    }
    return new ReviewPolicySignal(props)
  }

  static reconstruct(props: ReviewPolicySignalProps): ReviewPolicySignal {
    return new ReviewPolicySignal(props)
  }

  equals(other: ReviewPolicySignal): boolean {
    return this.props.id.equals(other.props.id)
  }
}
