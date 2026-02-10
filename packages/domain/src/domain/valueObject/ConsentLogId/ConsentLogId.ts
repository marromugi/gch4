/**
 * 同意ログの一意識別子
 */
export class ConsentLogId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ConsentLogId {
    if (!value || value.length === 0) {
      throw new Error('ConsentLogId cannot be empty')
    }
    return new ConsentLogId(value)
  }

  equals(other: ConsentLogId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
