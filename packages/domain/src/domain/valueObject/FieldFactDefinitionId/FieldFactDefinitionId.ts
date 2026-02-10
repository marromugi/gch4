/**
 * フィールドFact定義の一意識別子
 */
export class FieldFactDefinitionId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): FieldFactDefinitionId {
    if (!value || value.length === 0) {
      throw new Error('FieldFactDefinitionId cannot be empty')
    }
    return new FieldFactDefinitionId(value)
  }

  equals(other: FieldFactDefinitionId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
