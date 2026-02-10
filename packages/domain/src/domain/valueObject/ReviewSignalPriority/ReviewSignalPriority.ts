const REVIEW_SIGNAL_PRIORITIES = ['high', 'supporting', 'concern'] as const
export type ReviewSignalPriorityValue = (typeof REVIEW_SIGNAL_PRIORITIES)[number]

/**
 * レビューシグナルの優先度
 */
export class ReviewSignalPriority {
  private constructor(private readonly _value: ReviewSignalPriorityValue) {}

  get value(): ReviewSignalPriorityValue {
    return this._value
  }

  static from(value: string): ReviewSignalPriority {
    if (!REVIEW_SIGNAL_PRIORITIES.includes(value as ReviewSignalPriorityValue)) {
      throw new Error(`Invalid ReviewSignalPriority: ${value}`)
    }
    return new ReviewSignalPriority(value as ReviewSignalPriorityValue)
  }

  static high(): ReviewSignalPriority {
    return new ReviewSignalPriority('high')
  }

  static supporting(): ReviewSignalPriority {
    return new ReviewSignalPriority('supporting')
  }

  static concern(): ReviewSignalPriority {
    return new ReviewSignalPriority('concern')
  }

  isHigh(): boolean {
    return this._value === 'high'
  }

  isSupporting(): boolean {
    return this._value === 'supporting'
  }

  isConcern(): boolean {
    return this._value === 'concern'
  }

  equals(other: ReviewSignalPriority): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
