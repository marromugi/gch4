/**
 * フォーム回答の一意識別子
 */
export class SubmissionId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): SubmissionId {
    if (!value || value.length === 0) {
      throw new Error('SubmissionId cannot be empty')
    }
    return new SubmissionId(value)
  }

  equals(other: SubmissionId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
