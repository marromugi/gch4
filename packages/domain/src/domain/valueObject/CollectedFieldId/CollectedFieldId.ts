/**
 * 収集フィールドの一意識別子
 */
export class CollectedFieldId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): CollectedFieldId {
    if (!value || value.length === 0) {
      throw new Error('CollectedFieldId cannot be empty')
    }
    return new CollectedFieldId(value)
  }

  equals(other: CollectedFieldId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
