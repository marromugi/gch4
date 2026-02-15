import { Result } from '../../../domain/shared/Result/Result'
import type { FormField } from '../../../domain/entity/FormField/FormField'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'

// --- Error ---

export class GetFormFieldsNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'GetFormFieldsNotFoundError'
  }
}

export class GetFormFieldsForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Access denied')
    this.name = 'GetFormFieldsForbiddenError'
  }
}

export class GetFormFieldsRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'GetFormFieldsRepositoryError'
  }
}

export type GetFormFieldsError =
  | GetFormFieldsNotFoundError
  | GetFormFieldsForbiddenError
  | GetFormFieldsRepositoryError

// --- Input / Output ---

export interface GetFormFieldsInput {
  formId: string
  userId: string | null // null = 未認証ユーザー
}

export interface GetFormFieldsDeps {
  formRepository: IFormRepository
}

export type GetFormFieldsOutput = FormField[]

// --- Usecase ---

export class GetFormFieldsUsecase {
  constructor(private readonly deps: GetFormFieldsDeps) {}

  async execute(
    input: GetFormFieldsInput
  ): Promise<Result<GetFormFieldsOutput, GetFormFieldsError>> {
    const formId = FormId.fromString(input.formId)

    // フォームの存在と権限チェック
    const formResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(formResult)) {
      return Result.err(new GetFormFieldsNotFoundError(input.formId))
    }

    const form = formResult.value

    // 権限チェック: 所有者 or 公開済み
    const isOwner = input.userId && form.createdBy.equals(UserId.fromString(input.userId))
    const isPublished = form.status.equals(FormStatus.published())

    if (!isOwner && !isPublished) {
      return Result.err(new GetFormFieldsForbiddenError())
    }

    // フィールド取得
    const fieldsResult = await this.deps.formRepository.findFormFieldsByFormId(formId)
    if (Result.isErr(fieldsResult)) {
      return Result.err(new GetFormFieldsRepositoryError(fieldsResult.error))
    }

    return Result.ok(fieldsResult.value)
  }
}
