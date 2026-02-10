/**
 * 求人スキーマバージョンの一意識別子
 */
export class JobSchemaVersionId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): JobSchemaVersionId {
    if (!value || value.length === 0) {
      throw new Error('JobSchemaVersionId cannot be empty')
    }
    return new JobSchemaVersionId(value)
  }

  equals(other: JobSchemaVersionId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
