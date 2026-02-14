import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { ISubmissionRepository } from '../../../domain/repository/ISubmissionRepository/ISubmissionRepository'
import { ConsentLog } from '../../../domain/entity/ConsentLog/ConsentLog'
import { SubmissionId } from '../../../domain/valueObject/SubmissionId/SubmissionId'
import { ConsentLogId } from '../../../domain/valueObject/ConsentLogId/ConsentLogId'
import { ConsentType } from '../../../domain/valueObject/ConsentType/ConsentType'

// --- Error ---
export class SaveConsentLogNotFoundError extends Error {
  readonly type = 'not_found' as const
  constructor(submissionId: string) {
    super(`Submission not found: ${submissionId}`)
    this.name = 'SaveConsentLogNotFoundError'
  }
}

export class SaveConsentLogRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SaveConsentLogRepositoryError'
  }
}

export class SaveConsentLogValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SaveConsentLogValidationError'
  }
}

export type SaveConsentLogError =
  | SaveConsentLogNotFoundError
  | SaveConsentLogRepositoryError
  | SaveConsentLogValidationError

// --- Input / Output / Deps ---
export interface SaveConsentLogInput {
  submissionId: string
  consentType: string
  consentLogId: string
  consented: boolean
  ipAddress?: string
  userAgent?: string
}

export interface SaveConsentLogDeps {
  submissionRepository: ISubmissionRepository
}

export type SaveConsentLogOutput = ConsentLog

// --- Usecase ---
export class SaveConsentLogUsecase {
  constructor(private readonly deps: SaveConsentLogDeps) {}

  async execute(
    input: SaveConsentLogInput
  ): Promise<Result<SaveConsentLogOutput, SaveConsentLogError>> {
    // バリデーション
    let consentType: ConsentType
    try {
      consentType = ConsentType.from(input.consentType)
    } catch {
      return R.err(new SaveConsentLogValidationError(`Invalid consentType: ${input.consentType}`))
    }

    const submissionId = SubmissionId.fromString(input.submissionId)

    // Submission の存在確認
    const findResult = await this.deps.submissionRepository.findById(submissionId)
    if (!findResult.success) {
      return R.err(new SaveConsentLogRepositoryError(findResult.error.message))
    }

    // ConsentLog を作成
    const consentLog = ConsentLog.create({
      id: ConsentLogId.fromString(input.consentLogId),
      submissionId,
      consentType,
      consented: input.consented,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      createdAt: new Date(),
    })

    // 保存
    const saveResult = await this.deps.submissionRepository.saveConsentLog(consentLog)
    if (!saveResult.success) {
      return R.err(new SaveConsentLogRepositoryError(saveResult.error.message))
    }

    return R.ok(consentLog)
  }
}
