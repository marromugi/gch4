/**
 * ツール呼び出しログの一意識別子
 */
export class ToolCallLogId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): ToolCallLogId {
    if (!value || value.length === 0) {
      throw new Error('ToolCallLogId cannot be empty')
    }
    return new ToolCallLogId(value)
  }

  equals(other: ToolCallLogId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
