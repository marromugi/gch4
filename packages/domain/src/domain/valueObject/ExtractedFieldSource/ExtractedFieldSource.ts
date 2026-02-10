const EXTRACTED_FIELD_SOURCES = ['llm', 'manual'] as const
export type ExtractedFieldSourceValue = (typeof EXTRACTED_FIELD_SOURCES)[number]

/**
 * 抽出フィールドのソース（LLM自動抽出 or 手入力）
 */
export class ExtractedFieldSource {
  private constructor(private readonly _value: ExtractedFieldSourceValue) {}

  get value(): ExtractedFieldSourceValue {
    return this._value
  }

  static from(value: string): ExtractedFieldSource {
    if (!EXTRACTED_FIELD_SOURCES.includes(value as ExtractedFieldSourceValue)) {
      throw new Error(`Invalid ExtractedFieldSource: ${value}`)
    }
    return new ExtractedFieldSource(value as ExtractedFieldSourceValue)
  }

  static llm(): ExtractedFieldSource {
    return new ExtractedFieldSource('llm')
  }

  static manual(): ExtractedFieldSource {
    return new ExtractedFieldSource('manual')
  }

  isLlm(): boolean {
    return this._value === 'llm'
  }

  isManual(): boolean {
    return this._value === 'manual'
  }

  equals(other: ExtractedFieldSource): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
