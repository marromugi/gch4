const CHAT_SESSION_STATUSES = ['active', 'completed'] as const
export type ChatSessionStatusValue = (typeof CHAT_SESSION_STATUSES)[number]

/**
 * チャットセッションのステータス
 * active -> completed
 */
export class ChatSessionStatus {
  private constructor(private readonly _value: ChatSessionStatusValue) {}

  get value(): ChatSessionStatusValue {
    return this._value
  }

  static from(value: string): ChatSessionStatus {
    if (!CHAT_SESSION_STATUSES.includes(value as ChatSessionStatusValue)) {
      throw new Error(`Invalid ChatSessionStatus: ${value}`)
    }
    return new ChatSessionStatus(value as ChatSessionStatusValue)
  }

  static active(): ChatSessionStatus {
    return new ChatSessionStatus('active')
  }

  static completed(): ChatSessionStatus {
    return new ChatSessionStatus('completed')
  }

  isActive(): boolean {
    return this._value === 'active'
  }

  isCompleted(): boolean {
    return this._value === 'completed'
  }

  canTransitionTo(next: ChatSessionStatus): boolean {
    return this._value === 'active' && next._value === 'completed'
  }

  equals(other: ChatSessionStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
