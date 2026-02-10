/**
 * ユーザーの一意識別子
 */
export class UserId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): UserId {
    if (!value || value.length === 0) {
      throw new Error('UserId cannot be empty')
    }
    return new UserId(value)
  }

  equals(other: UserId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
