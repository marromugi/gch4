/**
 * 回答タスクの一意識別子
 */
export class SubmissionTaskId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): SubmissionTaskId {
    if (!value || value.length === 0) {
      throw new Error('SubmissionTaskId cannot be empty')
    }
    return new SubmissionTaskId(value)
  }

  equals(other: SubmissionTaskId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
