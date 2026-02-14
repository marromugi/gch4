const EVENT_TYPES = [
  'chat_started',
  'session_bootstrap_completed',
  'review_completed',
  'consent_checked',
  'submission_submitted',
  'manual_fallback_triggered',
] as const
export type EventTypeValue = (typeof EVENT_TYPES)[number]

/**
 * イベントの種別
 */
export class EventType {
  private constructor(private readonly _value: EventTypeValue) {}

  get value(): EventTypeValue {
    return this._value
  }

  static from(value: string): EventType {
    if (!EVENT_TYPES.includes(value as EventTypeValue)) {
      throw new Error(`Invalid EventType: ${value}`)
    }
    return new EventType(value as EventTypeValue)
  }

  static chatStarted(): EventType {
    return new EventType('chat_started')
  }

  static sessionBootstrapCompleted(): EventType {
    return new EventType('session_bootstrap_completed')
  }

  static reviewCompleted(): EventType {
    return new EventType('review_completed')
  }

  static consentChecked(): EventType {
    return new EventType('consent_checked')
  }

  static submissionSubmitted(): EventType {
    return new EventType('submission_submitted')
  }

  static manualFallbackTriggered(): EventType {
    return new EventType('manual_fallback_triggered')
  }

  equals(other: EventType): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
