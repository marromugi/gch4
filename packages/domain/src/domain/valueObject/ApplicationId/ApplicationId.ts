/**
 * 応募の一意識別子
 */
export class ApplicationId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ApplicationId {
    if (!value || value.length === 0) {
      throw new Error('ApplicationId cannot be empty')
    }
    return new ApplicationId(value)
  }

  equals(other: ApplicationId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
