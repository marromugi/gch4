const APPLICATION_STATUSES = ['new', 'scheduling', 'interviewed', 'closed'] as const
export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number]

/**
 * 応募のステータス
 * new -> scheduling -> interviewed -> closed
 */
export class ApplicationStatus {
  private constructor(private readonly _value: ApplicationStatusValue) {}

  get value(): ApplicationStatusValue {
    return this._value
  }

  static from(value: string): ApplicationStatus {
    if (!APPLICATION_STATUSES.includes(value as ApplicationStatusValue)) {
      throw new Error(`Invalid ApplicationStatus: ${value}`)
    }
    return new ApplicationStatus(value as ApplicationStatusValue)
  }

  static new(): ApplicationStatus {
    return new ApplicationStatus('new')
  }

  static scheduling(): ApplicationStatus {
    return new ApplicationStatus('scheduling')
  }

  static interviewed(): ApplicationStatus {
    return new ApplicationStatus('interviewed')
  }

  static closed(): ApplicationStatus {
    return new ApplicationStatus('closed')
  }

  isNew(): boolean {
    return this._value === 'new'
  }

  isScheduling(): boolean {
    return this._value === 'scheduling'
  }

  isInterviewed(): boolean {
    return this._value === 'interviewed'
  }

  isClosed(): boolean {
    return this._value === 'closed'
  }

  canTransitionTo(next: ApplicationStatus): boolean {
    switch (this._value) {
      case 'new':
        return next._value === 'scheduling' || next._value === 'closed'
      case 'scheduling':
        return next._value === 'interviewed' || next._value === 'closed'
      case 'interviewed':
        return next._value === 'closed'
      case 'closed':
        return false
    }
  }

  equals(other: ApplicationStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
