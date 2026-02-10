/**
 * イベントログの一意識別子
 */
export class EventLogId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value
  }

  static fromString(value: string): EventLogId {
    if (!value || value.length === 0) {
      throw new Error('EventLogId cannot be empty')
    }
    return new EventLogId(value)
  }

  equals(other: EventLogId): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
