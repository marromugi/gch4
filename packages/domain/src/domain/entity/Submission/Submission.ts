import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import type { FormId } from '../../valueObject/FormId/FormId'
import type { FormSchemaVersionId } from '../../valueObject/FormSchemaVersionId/FormSchemaVersionId'
import { SubmissionStatus } from '../../valueObject/SubmissionStatus/SubmissionStatus'

export interface SubmissionProps {
  id: SubmissionId
  formId: FormId
  schemaVersionId: FormSchemaVersionId
  respondentName: string | null
  respondentEmail: string | null
  language: string | null
  status: SubmissionStatus
  reviewCompletedAt: Date | null
  consentCheckedAt: Date | null
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * フォーム回答エンティティ（Submission集約ルート）
 */
export class Submission implements TimestampedEntity<SubmissionId> {
  private constructor(private readonly props: SubmissionProps) {}

  get id(): SubmissionId {
    return this.props.id
  }

  get formId(): FormId {
    return this.props.formId
  }

  get schemaVersionId(): FormSchemaVersionId {
    return this.props.schemaVersionId
  }

  get respondentName(): string | null {
    return this.props.respondentName
  }

  get respondentEmail(): string | null {
    return this.props.respondentEmail
  }

  get language(): string | null {
    return this.props.language
  }

  get status(): SubmissionStatus {
    return this.props.status
  }

  get reviewCompletedAt(): Date | null {
    return this.props.reviewCompletedAt
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

  static create(props: SubmissionProps): Submission {
    return new Submission(props)
  }

  static reconstruct(props: SubmissionProps): Submission {
    return new Submission(props)
  }

  /**
   * セッションブートストラップ情報を設定する
   */
  setBootstrapInfo(language: string): Submission {
    return new Submission({
      ...this.props,
      language,
      updatedAt: new Date(),
    })
  }

  /**
   * レビュー完了を記録する
   */
  markReviewCompleted(): Submission {
    return new Submission({
      ...this.props,
      reviewCompletedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * 同意チェックを記録する
   * レビュー完了が先に行われている必要がある
   */
  markConsentChecked(): Submission {
    if (!this.props.reviewCompletedAt) {
      throw new Error('Review must be completed before consent check')
    }
    return new Submission({
      ...this.props,
      consentCheckedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * 回答を確定する
   * 同意チェックが先に完了している必要がある
   */
  submit(): Submission {
    if (!this.props.reviewCompletedAt) {
      throw new Error('Review must be completed before submission')
    }
    if (!this.props.consentCheckedAt) {
      throw new Error('Consent must be checked before submission')
    }
    return new Submission({
      ...this.props,
      status: SubmissionStatus.submitted(),
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  /**
   * ステータスを遷移する
   */
  transitionTo(nextStatus: SubmissionStatus): Submission {
    if (!this.props.status.canTransitionTo(nextStatus)) {
      throw new Error(`Cannot transition from ${this.props.status.value} to ${nextStatus.value}`)
    }
    return new Submission({
      ...this.props,
      status: nextStatus,
      updatedAt: new Date(),
    })
  }

  equals(other: Submission): boolean {
    return this.props.id.equals(other.props.id)
  }
}
