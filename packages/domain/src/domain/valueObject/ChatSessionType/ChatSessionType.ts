const CHAT_SESSION_TYPES = ['application', 'interview_feedback', 'policy_creation'] as const
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

  static application(): ChatSessionType {
    return new ChatSessionType('application')
  }

  static interviewFeedback(): ChatSessionType {
    return new ChatSessionType('interview_feedback')
  }

  static policyCreation(): ChatSessionType {
    return new ChatSessionType('policy_creation')
  }

  isApplication(): boolean {
    return this._value === 'application'
  }

  isInterviewFeedback(): boolean {
    return this._value === 'interview_feedback'
  }

  isPolicyCreation(): boolean {
    return this._value === 'policy_creation'
  }

  equals(other: ChatSessionType): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
