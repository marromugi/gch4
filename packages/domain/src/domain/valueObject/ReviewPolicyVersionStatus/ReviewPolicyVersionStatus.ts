const REVIEW_POLICY_VERSION_STATUSES = ['draft', 'confirmed', 'published'] as const
export type ReviewPolicyVersionStatusValue = (typeof REVIEW_POLICY_VERSION_STATUSES)[number]

/**
 * レビュー方針バージョンのステータス
 * draft -> confirmed -> published
 */
export class ReviewPolicyVersionStatus {
  private constructor(private readonly _value: ReviewPolicyVersionStatusValue) {}

  get value(): ReviewPolicyVersionStatusValue {
    return this._value
  }

  static from(value: string): ReviewPolicyVersionStatus {
    if (!REVIEW_POLICY_VERSION_STATUSES.includes(value as ReviewPolicyVersionStatusValue)) {
      throw new Error(`Invalid ReviewPolicyVersionStatus: ${value}`)
    }
    return new ReviewPolicyVersionStatus(value as ReviewPolicyVersionStatusValue)
  }

  static draft(): ReviewPolicyVersionStatus {
    return new ReviewPolicyVersionStatus('draft')
  }

  static confirmed(): ReviewPolicyVersionStatus {
    return new ReviewPolicyVersionStatus('confirmed')
  }

  static published(): ReviewPolicyVersionStatus {
    return new ReviewPolicyVersionStatus('published')
  }

  isDraft(): boolean {
    return this._value === 'draft'
  }

  isConfirmed(): boolean {
    return this._value === 'confirmed'
  }

  isPublished(): boolean {
    return this._value === 'published'
  }

  canTransitionTo(next: ReviewPolicyVersionStatus): boolean {
    switch (this._value) {
      case 'draft':
        return next._value === 'confirmed'
      case 'confirmed':
        return next._value === 'published'
      case 'published':
        return false
    }
  }

  equals(other: ReviewPolicyVersionStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
