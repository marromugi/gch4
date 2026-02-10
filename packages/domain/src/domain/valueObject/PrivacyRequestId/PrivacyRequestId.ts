/**
 * プライバシーリクエストの一意識別子
 */
export class PrivacyRequestId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): PrivacyRequestId {
    if (!value || value.length === 0) {
      throw new Error('PrivacyRequestId cannot be empty')
    }
    return new PrivacyRequestId(value)
  }

  equals(other: PrivacyRequestId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
