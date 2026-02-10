const CHAT_MESSAGE_ROLES = ['user', 'assistant', 'system'] as const
export type ChatMessageRoleValue = (typeof CHAT_MESSAGE_ROLES)[number]

/**
 * チャットメッセージのロール
 */
export class ChatMessageRole {
  private constructor(private readonly _value: ChatMessageRoleValue) {}

  get value(): ChatMessageRoleValue {
    return this._value
  }

  static from(value: string): ChatMessageRole {
    if (!CHAT_MESSAGE_ROLES.includes(value as ChatMessageRoleValue)) {
      throw new Error(`Invalid ChatMessageRole: ${value}`)
    }
    return new ChatMessageRole(value as ChatMessageRoleValue)
  }

  static user(): ChatMessageRole {
    return new ChatMessageRole('user')
  }

  static assistant(): ChatMessageRole {
    return new ChatMessageRole('assistant')
  }

  static system(): ChatMessageRole {
    return new ChatMessageRole('system')
  }

  isUser(): boolean {
    return this._value === 'user'
  }

  isAssistant(): boolean {
    return this._value === 'assistant'
  }

  isSystem(): boolean {
    return this._value === 'system'
  }

  equals(other: ChatMessageRole): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
