import { Result } from '../../../domain/shared/Result/Result'
import type { Form } from '../../../domain/entity/Form/Form'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'

// --- Error ---

export class GetFormNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'GetFormNotFoundError'
  }
}

export class GetFormForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Access denied')
    this.name = 'GetFormForbiddenError'
  }
}

export class GetFormRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'GetFormRepositoryError'
  }
}

export type GetFormError = GetFormNotFoundError | GetFormForbiddenError | GetFormRepositoryError

// --- Input / Output ---

export interface GetFormInput {
  formId: string
  userId: string | null // null = 未認証ユーザー
}

export interface GetFormDeps {
  formRepository: IFormRepository
}

export type GetFormOutput = Form

// --- Usecase ---

export class GetFormUsecase {
  constructor(private readonly deps: GetFormDeps) {}

  async execute(input: GetFormInput): Promise<Result<GetFormOutput, GetFormError>> {
    const formId = FormId.fromString(input.formId)

    const result = await this.deps.formRepository.findById(formId)
    if (Result.isErr(result)) {
      return Result.err(new GetFormNotFoundError(input.formId))
    }

    const form = result.value

    // 権限チェック: 所有者 or 公開済み
    const isOwner = input.userId && form.createdBy.equals(UserId.fromString(input.userId))
    const isPublished = form.status.equals(FormStatus.published())

    if (!isOwner && !isPublished) {
      return Result.err(new GetFormForbiddenError())
    }

    return Result.ok(form)
  }
}
