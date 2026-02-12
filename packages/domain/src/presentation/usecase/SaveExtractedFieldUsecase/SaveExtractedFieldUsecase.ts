import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import { ExtractedField } from '../../../domain/entity/ExtractedField/ExtractedField'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ExtractedFieldId } from '../../../domain/valueObject/ExtractedFieldId/ExtractedFieldId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { ExtractedFieldSource } from '../../../domain/valueObject/ExtractedFieldSource/ExtractedFieldSource'

// --- Error ---
export class SaveExtractedFieldNotFoundError extends Error {
  readonly type = 'not_found' as const
  constructor(applicationId: string) {
    super(`Application not found: ${applicationId}`)
    this.name = 'SaveExtractedFieldNotFoundError'
  }
}

export class SaveExtractedFieldRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SaveExtractedFieldRepositoryError'
  }
}

export class SaveExtractedFieldValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SaveExtractedFieldValidationError'
  }
}

export type SaveExtractedFieldError =
  | SaveExtractedFieldNotFoundError
  | SaveExtractedFieldRepositoryError
  | SaveExtractedFieldValidationError

// --- Input / Output / Deps ---
export interface SaveExtractedFieldInput {
  applicationId: string
  extractedFieldId: string
  jobFormFieldId: string
  value: string
  source: string
}

export interface SaveExtractedFieldDeps {
  applicationRepository: IApplicationRepository
}

export type SaveExtractedFieldOutput = ExtractedField

// --- Usecase ---
export class SaveExtractedFieldUsecase {
  constructor(private readonly deps: SaveExtractedFieldDeps) {}

  async execute(
    input: SaveExtractedFieldInput
  ): Promise<Result<SaveExtractedFieldOutput, SaveExtractedFieldError>> {
    // バリデーション
    let source: ExtractedFieldSource
    try {
      source = ExtractedFieldSource.from(input.source)
    } catch {
      return R.err(new SaveExtractedFieldValidationError(`Invalid source: ${input.source}`))
    }

    const applicationId = ApplicationId.fromString(input.applicationId)

    // Application の存在確認
    const findResult = await this.deps.applicationRepository.findById(applicationId)
    if (!findResult.success) {
      return R.err(new SaveExtractedFieldRepositoryError(findResult.error.message))
    }

    const now = new Date()

    // ExtractedField を作成
    const extractedField = ExtractedField.create({
      id: ExtractedFieldId.fromString(input.extractedFieldId),
      applicationId,
      jobFormFieldId: JobFormFieldId.fromString(input.jobFormFieldId),
      value: input.value,
      source,
      confirmed: false,
      createdAt: now,
      updatedAt: now,
    })

    // 保存
    const saveResult = await this.deps.applicationRepository.saveExtractedField(extractedField)
    if (!saveResult.success) {
      return R.err(new SaveExtractedFieldRepositoryError(saveResult.error.message))
    }

    return R.ok(extractedField)
  }
}
