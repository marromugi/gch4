/**
 * フォームの一意識別子
 */
export class FormId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): FormId {
    if (!value || value.length === 0) {
      throw new Error('FormId cannot be empty')
    }
    return new FormId(value)
  }

  equals(other: FormId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
