/**
 * チャットセッションの一意識別子
 */
export class ChatSessionId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ChatSessionId {
    if (!value || value.length === 0) {
      throw new Error('ChatSessionId cannot be empty')
    }
    return new ChatSessionId(value)
  }

  equals(other: ChatSessionId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
