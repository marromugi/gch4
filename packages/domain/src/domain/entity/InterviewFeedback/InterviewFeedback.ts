import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { InterviewFeedbackId } from '../../valueObject/InterviewFeedbackId/InterviewFeedbackId'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'

export interface InterviewFeedbackProps {
  id: InterviewFeedbackId
  applicationId: ApplicationId
  chatSessionId: ChatSessionId
  policyVersionId: ReviewPolicyVersionId
  structuredData: string | null
  structuredSchemaVersion: number
  summaryConfirmedAt: Date | null
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 面談後フィードバックエンティティ（InterviewFeedback集約ルート）
 */
export class InterviewFeedback implements TimestampedEntity<InterviewFeedbackId> {
  private constructor(private readonly props: InterviewFeedbackProps) {}

  get id(): InterviewFeedbackId {
    return this.props.id
  }

  get applicationId(): ApplicationId {
    return this.props.applicationId
  }

  get chatSessionId(): ChatSessionId {
    return this.props.chatSessionId
  }

  get policyVersionId(): ReviewPolicyVersionId {
    return this.props.policyVersionId
  }

  get structuredData(): string | null {
    return this.props.structuredData
  }

  get structuredSchemaVersion(): number {
    return this.props.structuredSchemaVersion
  }

  get summaryConfirmedAt(): Date | null {
    return this.props.summaryConfirmedAt
  }

  get submittedAt(): Date | null {
    return this.props.submittedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: InterviewFeedbackProps): InterviewFeedback {
    return new InterviewFeedback(props)
  }

  static reconstruct(props: InterviewFeedbackProps): InterviewFeedback {
    return new InterviewFeedback(props)
  }

  updateStructuredData(data: string): InterviewFeedback {
    return new InterviewFeedback({
      ...this.props,
      structuredData: data,
      updatedAt: new Date(),
    })
  }

  confirmSummary(): InterviewFeedback {
    return new InterviewFeedback({
      ...this.props,
      summaryConfirmedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  submit(): InterviewFeedback {
    if (!this.props.summaryConfirmedAt) {
      throw new Error('Summary must be confirmed before submission')
    }
    return new InterviewFeedback({
      ...this.props,
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  equals(other: InterviewFeedback): boolean {
    return this.props.id.equals(other.props.id)
  }
}
