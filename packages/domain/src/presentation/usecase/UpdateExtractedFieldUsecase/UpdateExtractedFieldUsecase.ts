import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import type { ExtractedField } from '../../../domain/entity/ExtractedField/ExtractedField'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ExtractedFieldId } from '../../../domain/valueObject/ExtractedFieldId/ExtractedFieldId'
import { ExtractedFieldSource } from '../../../domain/valueObject/ExtractedFieldSource/ExtractedFieldSource'

// --- Error ---
export class UpdateExtractedFieldNotFoundError extends Error {
  readonly type = 'not_found' as const
  constructor(message: string) {
    super(message)
    this.name = 'UpdateExtractedFieldNotFoundError'
  }
}

export class UpdateExtractedFieldRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'UpdateExtractedFieldRepositoryError'
  }
}

export type UpdateExtractedFieldError =
  | UpdateExtractedFieldNotFoundError
  | UpdateExtractedFieldRepositoryError

// --- Input / Output / Deps ---
export interface UpdateExtractedFieldInput {
  applicationId: string
  extractedFieldId: string
  newValue: string
}

export interface UpdateExtractedFieldDeps {
  applicationRepository: IApplicationRepository
}

export type UpdateExtractedFieldOutput = ExtractedField

// --- Usecase ---
export class UpdateExtractedFieldUsecase {
  constructor(private readonly deps: UpdateExtractedFieldDeps) {}

  async execute(
    input: UpdateExtractedFieldInput
  ): Promise<Result<UpdateExtractedFieldOutput, UpdateExtractedFieldError>> {
    const applicationId = ApplicationId.fromString(input.applicationId)
    const extractedFieldId = ExtractedFieldId.fromString(input.extractedFieldId)

    // ExtractedField 一覧を取得
    const fieldsResult =
      await this.deps.applicationRepository.findExtractedFieldsByApplicationId(applicationId)
    if (!fieldsResult.success) {
      return R.err(new UpdateExtractedFieldRepositoryError(fieldsResult.error.message))
    }

    // 対象のフィールドを検索
    const target = fieldsResult.value.find((f) => f.id.equals(extractedFieldId))
    if (!target) {
      return R.err(
        new UpdateExtractedFieldNotFoundError(`ExtractedField not found: ${input.extractedFieldId}`)
      )
    }

    // 値を更新（確認・修正ステップでの変更なので source は manual）
    const updated = target.updateValue(input.newValue, ExtractedFieldSource.manual())

    // 保存
    const saveResult = await this.deps.applicationRepository.saveExtractedField(updated)
    if (!saveResult.success) {
      return R.err(new UpdateExtractedFieldRepositoryError(saveResult.error.message))
    }

    return R.ok(updated)
  }
}
