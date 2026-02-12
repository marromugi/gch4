import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import { ConsentLog } from '../../../domain/entity/ConsentLog/ConsentLog'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ConsentLogId } from '../../../domain/valueObject/ConsentLogId/ConsentLogId'
import { ConsentType } from '../../../domain/valueObject/ConsentType/ConsentType'

// --- Error ---
export class SaveConsentLogNotFoundError extends Error {
  readonly type = 'not_found' as const
  constructor(applicationId: string) {
    super(`Application not found: ${applicationId}`)
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
  applicationId: string
  consentType: string
  consentLogId: string
  consented: boolean
  ipAddress?: string
  userAgent?: string
}

export interface SaveConsentLogDeps {
  applicationRepository: IApplicationRepository
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

    const applicationId = ApplicationId.fromString(input.applicationId)

    // Application の存在確認
    const findResult = await this.deps.applicationRepository.findById(applicationId)
    if (!findResult.success) {
      return R.err(new SaveConsentLogRepositoryError(findResult.error.message))
    }

    // ConsentLog を作成
    const consentLog = ConsentLog.create({
      id: ConsentLogId.fromString(input.consentLogId),
      applicationId,
      consentType,
      consented: input.consented,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      createdAt: new Date(),
    })

    // 保存
    const saveResult = await this.deps.applicationRepository.saveConsentLog(consentLog)
    if (!saveResult.success) {
      return R.err(new SaveConsentLogRepositoryError(saveResult.error.message))
    }

    return R.ok(consentLog)
  }
}
