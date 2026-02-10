const CONSENT_TYPES = ['data_usage', 'privacy_policy'] as const
export type ConsentTypeValue = (typeof CONSENT_TYPES)[number]

/**
 * 同意の種別
 */
export class ConsentType {
  private constructor(private readonly _value: ConsentTypeValue) {}

  get value(): ConsentTypeValue {
    return this._value
  }

  static from(value: string): ConsentType {
    if (!CONSENT_TYPES.includes(value as ConsentTypeValue)) {
      throw new Error(`Invalid ConsentType: ${value}`)
    }
    return new ConsentType(value as ConsentTypeValue)
  }

  static dataUsage(): ConsentType {
    return new ConsentType('data_usage')
  }

  static privacyPolicy(): ConsentType {
    return new ConsentType('privacy_policy')
  }

  isDataUsage(): boolean {
    return this._value === 'data_usage'
  }

  isPrivacyPolicy(): boolean {
    return this._value === 'privacy_policy'
  }

  equals(other: ConsentType): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
