/**
 * 応募TodoのID
 */
export class ApplicationTodoId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ApplicationTodoId {
    if (!value || value.length === 0) {
      throw new Error('ApplicationTodoId cannot be empty')
    }
    return new ApplicationTodoId(value)
  }

  equals(other: ApplicationTodoId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
