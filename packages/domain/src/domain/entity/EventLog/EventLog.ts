import type { Entity } from '../../shared/Entity/Entity'
import type { EventLogId } from '../../valueObject/EventLogId/EventLogId'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { EventType } from '../../valueObject/EventType/EventType'

export interface EventLogProps {
  id: EventLogId
  jobId: JobId | null
  applicationId: ApplicationId | null
  chatSessionId: ChatSessionId | null
  policyVersionId: ReviewPolicyVersionId | null
  eventType: EventType
  metadata: string | null
  createdAt: Date
}

/**
 * イベントログエンティティ（集約外、追記のみ）
 */
export class EventLog implements Entity<EventLogId> {
  private constructor(private readonly props: EventLogProps) {}

  get id(): EventLogId {
    return this.props.id
  }

  get jobId(): JobId | null {
    return this.props.jobId
  }

  get applicationId(): ApplicationId | null {
    return this.props.applicationId
  }

  get chatSessionId(): ChatSessionId | null {
    return this.props.chatSessionId
  }

  get policyVersionId(): ReviewPolicyVersionId | null {
    return this.props.policyVersionId
  }

  get eventType(): EventType {
    return this.props.eventType
  }

  get metadata(): string | null {
    return this.props.metadata
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: EventLogProps): EventLog {
    return new EventLog(props)
  }

  static reconstruct(props: EventLogProps): EventLog {
    return new EventLog(props)
  }

  equals(other: EventLog): boolean {
    return this.props.id.equals(other.props.id)
  }
}
