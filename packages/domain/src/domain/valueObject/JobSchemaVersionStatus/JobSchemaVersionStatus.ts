const SCHEMA_VERSION_STATUSES = ['draft', 'approved'] as const
export type JobSchemaVersionStatusValue = (typeof SCHEMA_VERSION_STATUSES)[number]

/**
 * 求人スキーマバージョンのステータス
 * draft -> approved
 */
export class JobSchemaVersionStatus {
  private constructor(private readonly _value: JobSchemaVersionStatusValue) {}

  get value(): JobSchemaVersionStatusValue {
    return this._value
  }

  static from(value: string): JobSchemaVersionStatus {
    if (!SCHEMA_VERSION_STATUSES.includes(value as JobSchemaVersionStatusValue)) {
      throw new Error(`Invalid JobSchemaVersionStatus: ${value}`)
    }
    return new JobSchemaVersionStatus(value as JobSchemaVersionStatusValue)
  }

  static draft(): JobSchemaVersionStatus {
    return new JobSchemaVersionStatus('draft')
  }

  static approved(): JobSchemaVersionStatus {
    return new JobSchemaVersionStatus('approved')
  }

  isDraft(): boolean {
    return this._value === 'draft'
  }

  isApproved(): boolean {
    return this._value === 'approved'
  }

  canTransitionTo(next: JobSchemaVersionStatus): boolean {
    return this._value === 'draft' && next._value === 'approved'
  }

  equals(other: JobSchemaVersionStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
