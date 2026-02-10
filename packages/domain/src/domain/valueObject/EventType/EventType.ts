const EVENT_TYPES = [
  'chat_started',
  'session_bootstrap_completed',
  'extraction_reviewed',
  'consent_checked',
  'application_submitted',
  'manual_fallback_triggered',
  'policy_draft_started',
  'policy_draft_confirmed',
  'policy_version_published',
  'review_chat_started',
  'review_turn_soft_capped',
  'review_turn_hard_capped',
  'review_summary_confirmed',
  'review_submitted',
  'review_manual_fallback_triggered',
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

  static extractionReviewed(): EventType {
    return new EventType('extraction_reviewed')
  }

  static consentChecked(): EventType {
    return new EventType('consent_checked')
  }

  static applicationSubmitted(): EventType {
    return new EventType('application_submitted')
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
