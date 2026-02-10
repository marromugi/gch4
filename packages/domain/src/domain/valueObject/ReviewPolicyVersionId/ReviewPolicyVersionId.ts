/**
 * レビュー方針バージョンの一意識別子
 */
export class ReviewPolicyVersionId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ReviewPolicyVersionId {
    if (!value || value.length === 0) {
      throw new Error('ReviewPolicyVersionId cannot be empty')
    }
    return new ReviewPolicyVersionId(value)
  }

  equals(other: ReviewPolicyVersionId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
