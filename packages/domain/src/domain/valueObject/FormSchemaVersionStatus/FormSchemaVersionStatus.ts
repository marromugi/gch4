const SCHEMA_VERSION_STATUSES = ['draft', 'approved'] as const
export type FormSchemaVersionStatusValue = (typeof SCHEMA_VERSION_STATUSES)[number]

/**
 * フォームスキーマバージョンのステータス
 * draft -> approved
 */
export class FormSchemaVersionStatus {
  private constructor(private readonly _value: FormSchemaVersionStatusValue) {}

  get value(): FormSchemaVersionStatusValue {
    return this._value
  }

  static from(value: string): FormSchemaVersionStatus {
    if (!SCHEMA_VERSION_STATUSES.includes(value as FormSchemaVersionStatusValue)) {
      throw new Error(`Invalid FormSchemaVersionStatus: ${value}`)
    }
    return new FormSchemaVersionStatus(value as FormSchemaVersionStatusValue)
  }

  static draft(): FormSchemaVersionStatus {
    return new FormSchemaVersionStatus('draft')
  }

  static approved(): FormSchemaVersionStatus {
    return new FormSchemaVersionStatus('approved')
  }

  isDraft(): boolean {
    return this._value === 'draft'
  }

  isApproved(): boolean {
    return this._value === 'approved'
  }

  canTransitionTo(next: FormSchemaVersionStatus): boolean {
    return this._value === 'draft' && next._value === 'approved'
  }

  equals(other: FormSchemaVersionStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
