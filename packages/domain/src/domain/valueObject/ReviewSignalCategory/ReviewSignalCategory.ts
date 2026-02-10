const REVIEW_SIGNAL_CATEGORIES = ['must', 'ng', 'nice'] as const
export type ReviewSignalCategoryValue = (typeof REVIEW_SIGNAL_CATEGORIES)[number]

/**
 * レビューシグナルのカテゴリ
 */
export class ReviewSignalCategory {
  private constructor(private readonly _value: ReviewSignalCategoryValue) {}

  get value(): ReviewSignalCategoryValue {
    return this._value
  }

  static from(value: string): ReviewSignalCategory {
    if (!REVIEW_SIGNAL_CATEGORIES.includes(value as ReviewSignalCategoryValue)) {
      throw new Error(`Invalid ReviewSignalCategory: ${value}`)
    }
    return new ReviewSignalCategory(value as ReviewSignalCategoryValue)
  }

  static must(): ReviewSignalCategory {
    return new ReviewSignalCategory('must')
  }

  static ng(): ReviewSignalCategory {
    return new ReviewSignalCategory('ng')
  }

  static nice(): ReviewSignalCategory {
    return new ReviewSignalCategory('nice')
  }

  isMust(): boolean {
    return this._value === 'must'
  }

  isNg(): boolean {
    return this._value === 'ng'
  }

  isNice(): boolean {
    return this._value === 'nice'
  }

  equals(other: ReviewSignalCategory): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
