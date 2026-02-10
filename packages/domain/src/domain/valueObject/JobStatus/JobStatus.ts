const JOB_STATUSES = ['draft', 'open', 'closed'] as const
export type JobStatusValue = (typeof JOB_STATUSES)[number]

/**
 * 求人のステータス
 * draft -> open -> closed
 */
export class JobStatus {
  private constructor(private readonly _value: JobStatusValue) {}

  get value(): JobStatusValue {
    return this._value
  }

  static from(value: string): JobStatus {
    if (!JOB_STATUSES.includes(value as JobStatusValue)) {
      throw new Error(`Invalid JobStatus: ${value}`)
    }
    return new JobStatus(value as JobStatusValue)
  }

  static draft(): JobStatus {
    return new JobStatus('draft')
  }

  static open(): JobStatus {
    return new JobStatus('open')
  }

  static closed(): JobStatus {
    return new JobStatus('closed')
  }

  isDraft(): boolean {
    return this._value === 'draft'
  }

  isOpen(): boolean {
    return this._value === 'open'
  }

  isClosed(): boolean {
    return this._value === 'closed'
  }

  canTransitionTo(next: JobStatus): boolean {
    switch (this._value) {
      case 'draft':
        return next._value === 'open'
      case 'open':
        return next._value === 'closed'
      case 'closed':
        return false
    }
  }

  equals(other: JobStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
