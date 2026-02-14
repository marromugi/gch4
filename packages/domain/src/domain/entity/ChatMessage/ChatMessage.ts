import type { Entity } from '../../shared/Entity/Entity'
import type { ChatMessageId } from '../../valueObject/ChatMessageId/ChatMessageId'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { FormFieldId } from '../../valueObject/FormFieldId/FormFieldId'
import type { ChatMessageRole } from '../../valueObject/ChatMessageRole/ChatMessageRole'

export interface ChatMessageProps {
  id: ChatMessageId
  chatSessionId: ChatSessionId
  role: ChatMessageRole
  content: string
  targetFormFieldId: FormFieldId | null
  reviewPassed: boolean | null
  createdAt: Date
}

/**
 * チャットメッセージエンティティ（ChatSessionの子、追記のみ）
 */
export class ChatMessage implements Entity<ChatMessageId> {
  private constructor(private readonly props: ChatMessageProps) {}

  get id(): ChatMessageId {
    return this.props.id
  }

  get chatSessionId(): ChatSessionId {
    return this.props.chatSessionId
  }

  get role(): ChatMessageRole {
    return this.props.role
  }

  get content(): string {
    return this.props.content
  }

  get targetFormFieldId(): FormFieldId | null {
    return this.props.targetFormFieldId
  }

  get reviewPassed(): boolean | null {
    return this.props.reviewPassed
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: ChatMessageProps): ChatMessage {
    if (!props.content || props.content.trim().length === 0) {
      throw new Error('ChatMessage content cannot be empty')
    }
    return new ChatMessage(props)
  }

  static reconstruct(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props)
  }

  equals(other: ChatMessage): boolean {
    return this.props.id.equals(other.props.id)
  }
}
