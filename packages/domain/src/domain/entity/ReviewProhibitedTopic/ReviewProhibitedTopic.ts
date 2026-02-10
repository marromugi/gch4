import type { Entity } from '../../shared/Entity/Entity'
import type { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'

export interface ReviewProhibitedTopicProps {
  id: string
  policyVersionId: ReviewPolicyVersionId
  topic: string
  createdAt: Date
}

/**
 * レビュー禁止トピックエンティティ（ReviewPolicyVersionの子）
 */
export class ReviewProhibitedTopic implements Entity<string> {
  private constructor(private readonly props: ReviewProhibitedTopicProps) {}

  get id(): string {
    return this.props.id
  }

  get policyVersionId(): ReviewPolicyVersionId {
    return this.props.policyVersionId
  }

  get topic(): string {
    return this.props.topic
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: ReviewProhibitedTopicProps): ReviewProhibitedTopic {
    if (!props.topic || props.topic.trim().length === 0) {
      throw new Error('ReviewProhibitedTopic topic cannot be empty')
    }
    return new ReviewProhibitedTopic(props)
  }

  static reconstruct(props: ReviewProhibitedTopicProps): ReviewProhibitedTopic {
    return new ReviewProhibitedTopic(props)
  }

  equals(other: ReviewProhibitedTopic): boolean {
    return this.props.id === other.props.id
  }
}
