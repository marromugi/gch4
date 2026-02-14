const SUBMISSION_STATUSES = ['new', 'in_progress', 'review_completed', 'submitted'] as const
export type SubmissionStatusValue = (typeof SUBMISSION_STATUSES)[number]

/**
 * フォーム回答のステータス
 * new -> in_progress -> review_completed -> submitted
 */
export class SubmissionStatus {
  private constructor(private readonly _value: SubmissionStatusValue) {}

  get value(): SubmissionStatusValue {
    return this._value
  }

  static from(value: string): SubmissionStatus {
    if (!SUBMISSION_STATUSES.includes(value as SubmissionStatusValue)) {
      throw new Error(`Invalid SubmissionStatus: ${value}`)
    }
    return new SubmissionStatus(value as SubmissionStatusValue)
  }

  static new(): SubmissionStatus {
    return new SubmissionStatus('new')
  }

  static inProgress(): SubmissionStatus {
    return new SubmissionStatus('in_progress')
  }

  static reviewCompleted(): SubmissionStatus {
    return new SubmissionStatus('review_completed')
  }

  static submitted(): SubmissionStatus {
    return new SubmissionStatus('submitted')
  }

  isNew(): boolean {
    return this._value === 'new'
  }

  isInProgress(): boolean {
    return this._value === 'in_progress'
  }

  isReviewCompleted(): boolean {
    return this._value === 'review_completed'
  }

  isSubmitted(): boolean {
    return this._value === 'submitted'
  }

  canTransitionTo(next: SubmissionStatus): boolean {
    switch (this._value) {
      case 'new':
        return next._value === 'in_progress'
      case 'in_progress':
        return next._value === 'review_completed'
      case 'review_completed':
        return next._value === 'submitted'
      case 'submitted':
        return false
    }
  }

  equals(other: SubmissionStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
