/**
 * フォームスキーマバージョンの一意識別子
 */
export class FormSchemaVersionId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): FormSchemaVersionId {
    if (!value || value.length === 0) {
      throw new Error('FormSchemaVersionId cannot be empty')
    }
    return new FormSchemaVersionId(value)
  }

  equals(other: FormSchemaVersionId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
