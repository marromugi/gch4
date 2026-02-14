const FORM_STATUSES = ['draft', 'published', 'closed'] as const
export type FormStatusValue = (typeof FORM_STATUSES)[number]

/**
 * フォームのステータス
 * draft -> published -> closed
 */
export class FormStatus {
  private constructor(private readonly _value: FormStatusValue) {}

  get value(): FormStatusValue {
    return this._value
  }

  static from(value: string): FormStatus {
    if (!FORM_STATUSES.includes(value as FormStatusValue)) {
      throw new Error(`Invalid FormStatus: ${value}`)
    }
    return new FormStatus(value as FormStatusValue)
  }

  static draft(): FormStatus {
    return new FormStatus('draft')
  }

  static published(): FormStatus {
    return new FormStatus('published')
  }

  static closed(): FormStatus {
    return new FormStatus('closed')
  }

  isDraft(): boolean {
    return this._value === 'draft'
  }

  isPublished(): boolean {
    return this._value === 'published'
  }

  isClosed(): boolean {
    return this._value === 'closed'
  }

  canTransitionTo(next: FormStatus): boolean {
    switch (this._value) {
      case 'draft':
        return next._value === 'published'
      case 'published':
        return next._value === 'closed'
      case 'closed':
        return false
    }
  }

  equals(other: FormStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
