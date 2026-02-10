/**
 * チャットメッセージの一意識別子
 */
export class ChatMessageId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ChatMessageId {
    if (!value || value.length === 0) {
      throw new Error('ChatMessageId cannot be empty')
    }
    return new ChatMessageId(value)
  }

  equals(other: ChatMessageId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
