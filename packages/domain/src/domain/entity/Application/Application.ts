import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../valueObject/ApplicationStatus/ApplicationStatus'

export interface ApplicationProps {
  id: ApplicationId
  jobId: JobId
  schemaVersionId: JobSchemaVersionId
  applicantName: string | null
  applicantEmail: string | null
  language: string | null
  country: string | null
  timezone: string | null
  status: ApplicationStatus
  meetLink: string | null
  extractionReviewedAt: Date | null
  consentCheckedAt: Date | null
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 応募エンティティ（Application集約ルート）
 */
export class Application implements TimestampedEntity<ApplicationId> {
  private constructor(private readonly props: ApplicationProps) {}

  get id(): ApplicationId {
    return this.props.id
  }

  get jobId(): JobId {
    return this.props.jobId
  }

  get schemaVersionId(): JobSchemaVersionId {
    return this.props.schemaVersionId
  }

  get applicantName(): string | null {
    return this.props.applicantName
  }

  get applicantEmail(): string | null {
    return this.props.applicantEmail
  }

  get language(): string | null {
    return this.props.language
  }

  get country(): string | null {
    return this.props.country
  }

  get timezone(): string | null {
    return this.props.timezone
  }

  get status(): ApplicationStatus {
    return this.props.status
  }

  get meetLink(): string | null {
    return this.props.meetLink
  }

  get extractionReviewedAt(): Date | null {
    return this.props.extractionReviewedAt
  }

  get consentCheckedAt(): Date | null {
    return this.props.consentCheckedAt
  }

  get submittedAt(): Date | null {
    return this.props.submittedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: ApplicationProps): Application {
    return new Application(props)
  }

  static reconstruct(props: ApplicationProps): Application {
    return new Application(props)
  }

  /**
   * セッションブートストラップ情報を設定する
   */
  setBootstrapInfo(language: string, country: string, timezone: string): Application {
    return new Application({
      ...this.props,
      language,
      country,
      timezone,
      updatedAt: new Date(),
    })
  }

  /**
   * 抽出結果の確認を記録する
   */
  markExtractionReviewed(): Application {
    return new Application({
      ...this.props,
      extractionReviewedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * 同意チェックを記録する
   * 抽出確認が先に完了している必要がある
   */
  markConsentChecked(): Application {
    if (!this.props.extractionReviewedAt) {
      throw new Error('Extraction must be reviewed before consent check')
    }
    return new Application({
      ...this.props,
      consentCheckedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * 応募を確定する
   * 同意チェックが先に完了している必要がある
   */
  submit(): Application {
    if (!this.props.extractionReviewedAt) {
      throw new Error('Extraction must be reviewed before submission')
    }
    if (!this.props.consentCheckedAt) {
      throw new Error('Consent must be checked before submission')
    }
    return new Application({
      ...this.props,
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * ステータスを遷移する
   */
  transitionTo(nextStatus: ApplicationStatus): Application {
    if (!this.props.status.canTransitionTo(nextStatus)) {
      throw new Error(`Cannot transition from ${this.props.status.value} to ${nextStatus.value}`)
    }
    return new Application({
      ...this.props,
      status: nextStatus,
      updatedAt: new Date(),
    })
  }

  equals(other: Application): boolean {
    return this.props.id.equals(other.props.id)
  }
}
