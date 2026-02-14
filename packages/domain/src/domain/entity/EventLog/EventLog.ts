import type { Entity } from '../../shared/Entity/Entity'
import type { EventLogId } from '../../valueObject/EventLogId/EventLogId'
import type { FormId } from '../../valueObject/FormId/FormId'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { EventType } from '../../valueObject/EventType/EventType'

export interface EventLogProps {
  id: EventLogId
  formId: FormId | null
  submissionId: SubmissionId | null
  chatSessionId: ChatSessionId | null
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

  get formId(): FormId | null {
    return this.props.formId
  }

  get submissionId(): SubmissionId | null {
    return this.props.submissionId
  }

  get chatSessionId(): ChatSessionId | null {
    return this.props.chatSessionId
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
