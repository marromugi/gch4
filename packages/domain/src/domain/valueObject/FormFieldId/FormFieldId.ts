/**
 * フォームフィールドの一意識別子
 */
export class FormFieldId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): FormFieldId {
    if (!value || value.length === 0) {
      throw new Error('FormFieldId cannot be empty')
    }
    return new FormFieldId(value)
  }

  equals(other: FormFieldId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
