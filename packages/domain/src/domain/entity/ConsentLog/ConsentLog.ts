import type { Entity } from '../../shared/Entity/Entity'
import type { ConsentLogId } from '../../valueObject/ConsentLogId/ConsentLogId'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import type { ConsentType } from '../../valueObject/ConsentType/ConsentType'

export interface ConsentLogProps {
  id: ConsentLogId
  submissionId: SubmissionId
  consentType: ConsentType
  consented: boolean
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

/**
 * 同意ログエンティティ（Submission集約の子、追記のみ）
 */
export class ConsentLog implements Entity<ConsentLogId> {
  private constructor(private readonly props: ConsentLogProps) {}

  get id(): ConsentLogId {
    return this.props.id
  }

  get submissionId(): SubmissionId {
    return this.props.submissionId
  }

  get consentType(): ConsentType {
    return this.props.consentType
  }

  get consented(): boolean {
    return this.props.consented
  }

  get ipAddress(): string | null {
    return this.props.ipAddress
  }

  get userAgent(): string | null {
    return this.props.userAgent
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: ConsentLogProps): ConsentLog {
    return new ConsentLog(props)
  }

  static reconstruct(props: ConsentLogProps): ConsentLog {
    return new ConsentLog(props)
  }

  equals(other: ConsentLog): boolean {
    return this.props.id.equals(other.props.id)
  }
}
