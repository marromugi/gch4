/**
 * 求人フォーム項目の一意識別子
 */
export class JobFormFieldId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): JobFormFieldId {
    if (!value || value.length === 0) {
      throw new Error('JobFormFieldId cannot be empty')
    }
    return new JobFormFieldId(value)
  }

  equals(other: JobFormFieldId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
