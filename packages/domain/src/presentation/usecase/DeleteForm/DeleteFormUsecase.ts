import { Result } from '../../../domain/shared/Result/Result'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class DeleteFormNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'DeleteFormNotFoundError'
  }
}

export class DeleteFormForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Only the owner can delete this form')
    this.name = 'DeleteFormForbiddenError'
  }
}

export class DeleteFormRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'DeleteFormRepositoryError'
  }
}

export type DeleteFormError =
  | DeleteFormNotFoundError
  | DeleteFormForbiddenError
  | DeleteFormRepositoryError

// --- Input / Output ---

export interface DeleteFormInput {
  formId: string
  userId: string
}

export interface DeleteFormDeps {
  formRepository: IFormRepository
}

export type DeleteFormOutput = void

// --- Usecase ---

export class DeleteFormUsecase {
  constructor(private readonly deps: DeleteFormDeps) {}

  async execute(input: DeleteFormInput): Promise<Result<DeleteFormOutput, DeleteFormError>> {
    const formId = FormId.fromString(input.formId)

    const findResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(findResult)) {
      return Result.err(new DeleteFormNotFoundError(input.formId))
    }

    const form = findResult.value

    // 権限チェック: 所有者のみ
    if (!form.createdBy.equals(UserId.fromString(input.userId))) {
      return Result.err(new DeleteFormForbiddenError())
    }

    // 削除実行
    const deleteResult = await this.deps.formRepository.delete(form.id)
    if (Result.isErr(deleteResult)) {
      return Result.err(new DeleteFormRepositoryError(deleteResult.error))
    }

    return Result.ok(undefined)
  }
}
