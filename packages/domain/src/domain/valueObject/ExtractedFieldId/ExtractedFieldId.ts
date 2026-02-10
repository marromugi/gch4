/**
 * 抽出フィールドの一意識別子
 */
export class ExtractedFieldId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ExtractedFieldId {
    if (!value || value.length === 0) {
      throw new Error('ExtractedFieldId cannot be empty')
    }
    return new ExtractedFieldId(value)
  }

  equals(other: ExtractedFieldId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
