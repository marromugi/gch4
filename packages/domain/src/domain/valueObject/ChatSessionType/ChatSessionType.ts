const CHAT_SESSION_TYPES = ['form_response'] as const
export type ChatSessionTypeValue = (typeof CHAT_SESSION_TYPES)[number]

/**
 * チャットセッションの種別
 */
export class ChatSessionType {
  private constructor(private readonly _value: ChatSessionTypeValue) {}

  get value(): ChatSessionTypeValue {
    return this._value
  }

  static from(value: string): ChatSessionType {
    if (!CHAT_SESSION_TYPES.includes(value as ChatSessionTypeValue)) {
      throw new Error(`Invalid ChatSessionType: ${value}`)
    }
    return new ChatSessionType(value as ChatSessionTypeValue)
  }

  static formResponse(): ChatSessionType {
    return new ChatSessionType('form_response')
  }

  isFormResponse(): boolean {
    return this._value === 'form_response'
  }

  equals(other: ChatSessionType): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
