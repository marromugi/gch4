const COLLECTED_FIELD_SOURCES = ['llm', 'manual'] as const
export type CollectedFieldSourceValue = (typeof COLLECTED_FIELD_SOURCES)[number]

/**
 * 収集フィールドのソース（LLM自動収集 or 手入力）
 */
export class CollectedFieldSource {
  private constructor(private readonly _value: CollectedFieldSourceValue) {}

  get value(): CollectedFieldSourceValue {
    return this._value
  }

  static from(value: string): CollectedFieldSource {
    if (!COLLECTED_FIELD_SOURCES.includes(value as CollectedFieldSourceValue)) {
      throw new Error(`Invalid CollectedFieldSource: ${value}`)
    }
    return new CollectedFieldSource(value as CollectedFieldSourceValue)
  }

  static llm(): CollectedFieldSource {
    return new CollectedFieldSource('llm')
  }

  static manual(): CollectedFieldSource {
    return new CollectedFieldSource('manual')
  }

  isLlm(): boolean {
    return this._value === 'llm'
  }

  isManual(): boolean {
    return this._value === 'manual'
  }

  equals(other: CollectedFieldSource): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
