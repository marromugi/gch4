/**
 * 面談後フィードバックの一意識別子
 */
export class InterviewFeedbackId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): InterviewFeedbackId {
    if (!value || value.length === 0) {
      throw new Error('InterviewFeedbackId cannot be empty')
    }
    return new InterviewFeedbackId(value)
  }

  equals(other: InterviewFeedbackId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
