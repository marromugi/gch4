/**
 * 求人の一意識別子
 */
export class JobId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): JobId {
    if (!value || value.length === 0) {
      throw new Error('JobId cannot be empty')
    }
    return new JobId(value)
  }

  equals(other: JobId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
