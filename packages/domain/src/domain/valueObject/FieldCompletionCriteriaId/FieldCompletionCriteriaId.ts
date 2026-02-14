/**
 * フィールド完了条件の一意識別子
 */
export class FieldCompletionCriteriaId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): FieldCompletionCriteriaId {
    if (!value || value.length === 0) {
      throw new Error('FieldCompletionCriteriaId cannot be empty')
    }
    return new FieldCompletionCriteriaId(value)
  }

  equals(other: FieldCompletionCriteriaId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
