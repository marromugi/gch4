import { Result } from '../../../domain/shared/Result/Result'
import type { FormSchemaVersion } from '../../../domain/entity/FormSchemaVersion/FormSchemaVersion'
import type { FieldCompletionCriteria } from '../../../domain/entity/FieldCompletionCriteria/FieldCompletionCriteria'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'

// --- Error ---

export class GetFormSchemaNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'GetFormSchemaNotFoundError'
  }
}

export class GetFormSchemaForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Access denied')
    this.name = 'GetFormSchemaForbiddenError'
  }
}

export class GetFormSchemaRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'GetFormSchemaRepositoryError'
  }
}

export type GetFormSchemaError =
  | GetFormSchemaNotFoundError
  | GetFormSchemaForbiddenError
  | GetFormSchemaRepositoryError

// --- Input / Output ---

export interface GetFormSchemaInput {
  formId: string
  userId: string | null // null = 未認証ユーザー
}

export interface GetFormSchemaDeps {
  formRepository: IFormRepository
}

export interface GetFormSchemaOutput {
  schemaVersion: FormSchemaVersion
  completionCriteria: FieldCompletionCriteria[]
}

// --- Usecase ---

export class GetFormSchemaUsecase {
  constructor(private readonly deps: GetFormSchemaDeps) {}

  async execute(
    input: GetFormSchemaInput
  ): Promise<Result<GetFormSchemaOutput, GetFormSchemaError>> {
    const formId = FormId.fromString(input.formId)

    // フォームの存在と権限チェック
    const formResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(formResult)) {
      return Result.err(new GetFormSchemaNotFoundError(`Form not found: ${input.formId}`))
    }

    const form = formResult.value

    // 権限チェック: 所有者 or 公開済み
    const isOwner = input.userId && form.createdBy.equals(UserId.fromString(input.userId))
    const isPublished = form.status.equals(FormStatus.published())

    if (!isOwner && !isPublished) {
      return Result.err(new GetFormSchemaForbiddenError())
    }

    // 最新スキーマバージョン取得
    const schemaResult = await this.deps.formRepository.findLatestSchemaVersionByFormId(formId)
    if (Result.isErr(schemaResult)) {
      return Result.err(new GetFormSchemaRepositoryError(schemaResult.error))
    }

    const schemaVersion = schemaResult.value
    if (!schemaVersion) {
      return Result.err(new GetFormSchemaNotFoundError('No schema version found'))
    }

    // 完了条件取得
    const criteriaResult = await this.deps.formRepository.findCompletionCriteriaBySchemaVersionId(
      schemaVersion.id
    )
    if (Result.isErr(criteriaResult)) {
      return Result.err(new GetFormSchemaRepositoryError(criteriaResult.error))
    }

    return Result.ok({
      schemaVersion,
      completionCriteria: criteriaResult.value,
    })
  }
}
