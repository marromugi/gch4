/**
 * レビューシグナルの一意識別子
 */
export class ReviewPolicySignalId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ReviewPolicySignalId {
    if (!value || value.length === 0) {
      throw new Error('ReviewPolicySignalId cannot be empty')
    }
    return new ReviewPolicySignalId(value)
  }

  equals(other: ReviewPolicySignalId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
