import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { UserId } from '../../valueObject/UserId/UserId'
import type { ChatSessionType } from '../../valueObject/ChatSessionType/ChatSessionType'
import { ChatSessionStatus } from '../../valueObject/ChatSessionStatus/ChatSessionStatus'

export interface ChatSessionProps {
  id: ChatSessionId
  applicationId: ApplicationId | null
  jobId: JobId | null
  policyVersionId: ReviewPolicyVersionId | null
  type: ChatSessionType
  conductorId: UserId | null
  bootstrapCompleted: boolean
  status: ChatSessionStatus
  turnCount: number
  softCap: number | null
  hardCap: number | null
  softCappedAt: Date | null
  hardCappedAt: Date | null
  reviewFailStreak: number
  extractionFailStreak: number
  timeoutStreak: number
  createdAt: Date
  updatedAt: Date
}

/**
 * チャットセッションエンティティ
 */
export class ChatSession implements TimestampedEntity<ChatSessionId> {
  private constructor(private readonly props: ChatSessionProps) {}

  get id(): ChatSessionId {
    return this.props.id
  }

  get applicationId(): ApplicationId | null {
    return this.props.applicationId
  }

  get jobId(): JobId | null {
    return this.props.jobId
  }

  get policyVersionId(): ReviewPolicyVersionId | null {
    return this.props.policyVersionId
  }

  get type(): ChatSessionType {
    return this.props.type
  }

  get conductorId(): UserId | null {
    return this.props.conductorId
  }

  get bootstrapCompleted(): boolean {
    return this.props.bootstrapCompleted
  }

  get status(): ChatSessionStatus {
    return this.props.status
  }

  get turnCount(): number {
    return this.props.turnCount
  }

  get softCap(): number | null {
    return this.props.softCap
  }

  get hardCap(): number | null {
    return this.props.hardCap
  }

  get softCappedAt(): Date | null {
    return this.props.softCappedAt
  }

  get hardCappedAt(): Date | null {
    return this.props.hardCappedAt
  }

  get reviewFailStreak(): number {
    return this.props.reviewFailStreak
  }

  get extractionFailStreak(): number {
    return this.props.extractionFailStreak
  }

  get timeoutStreak(): number {
    return this.props.timeoutStreak
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: ChatSessionProps): ChatSession {
    return new ChatSession(props)
  }

  static reconstruct(props: ChatSessionProps): ChatSession {
    return new ChatSession(props)
  }

  completeBootstrap(): ChatSession {
    return new ChatSession({
      ...this.props,
      bootstrapCompleted: true,
      updatedAt: new Date(),
    })
  }

  incrementTurnCount(): ChatSession {
    return new ChatSession({
      ...this.props,
      turnCount: this.props.turnCount + 1,
      updatedAt: new Date(),
    })
  }

  incrementReviewFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      reviewFailStreak: this.props.reviewFailStreak + 1,
      updatedAt: new Date(),
    })
  }

  incrementExtractionFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      extractionFailStreak: this.props.extractionFailStreak + 1,
      updatedAt: new Date(),
    })
  }

  incrementTimeoutStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      timeoutStreak: this.props.timeoutStreak + 1,
      updatedAt: new Date(),
    })
  }

  resetReviewFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      reviewFailStreak: 0,
      updatedAt: new Date(),
    })
  }

  resetExtractionFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      extractionFailStreak: 0,
      updatedAt: new Date(),
    })
  }

  resetTimeoutStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      timeoutStreak: 0,
      updatedAt: new Date(),
    })
  }

  /**
   * フォールバック条件に達しているか
   */
  shouldFallback(): boolean {
    return (
      this.props.reviewFailStreak >= 3 ||
      this.props.extractionFailStreak >= 2 ||
      this.props.timeoutStreak >= 2
    )
  }

  complete(): ChatSession {
    if (!this.props.status.canTransitionTo(ChatSessionStatus.completed())) {
      throw new Error(`Cannot complete session in status: ${this.props.status.value}`)
    }
    return new ChatSession({
      ...this.props,
      status: ChatSessionStatus.completed(),
      updatedAt: new Date(),
    })
  }

  equals(other: ChatSession): boolean {
    return this.props.id.equals(other.props.id)
  }
}
