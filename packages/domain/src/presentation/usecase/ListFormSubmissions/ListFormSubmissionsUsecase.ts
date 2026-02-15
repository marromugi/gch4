import { Result } from '../../../domain/shared/Result/Result'
import type { Submission } from '../../../domain/entity/Submission/Submission'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import type { ISubmissionRepository } from '../../../domain/repository/ISubmissionRepository/ISubmissionRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class ListFormSubmissionsNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'ListFormSubmissionsNotFoundError'
  }
}

export class ListFormSubmissionsForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Only the owner can view submissions')
    this.name = 'ListFormSubmissionsForbiddenError'
  }
}

export class ListFormSubmissionsRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'ListFormSubmissionsRepositoryError'
  }
}

export type ListFormSubmissionsError =
  | ListFormSubmissionsNotFoundError
  | ListFormSubmissionsForbiddenError
  | ListFormSubmissionsRepositoryError

// --- Input / Output ---

export interface ListFormSubmissionsInput {
  formId: string
  userId: string
}

export interface ListFormSubmissionsDeps {
  formRepository: IFormRepository
  submissionRepository: ISubmissionRepository
}

export type ListFormSubmissionsOutput = Submission[]

// --- Usecase ---

export class ListFormSubmissionsUsecase {
  constructor(private readonly deps: ListFormSubmissionsDeps) {}

  async execute(
    input: ListFormSubmissionsInput
  ): Promise<Result<ListFormSubmissionsOutput, ListFormSubmissionsError>> {
    const formId = FormId.fromString(input.formId)

    // フォームの存在チェック
    const formResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(formResult)) {
      return Result.err(new ListFormSubmissionsNotFoundError(input.formId))
    }

    // 権限チェック: 所有者のみ
    if (!formResult.value.createdBy.equals(UserId.fromString(input.userId))) {
      return Result.err(new ListFormSubmissionsForbiddenError())
    }

    // 提出一覧取得
    const submissionsResult = await this.deps.submissionRepository.findByFormId(formId)
    if (Result.isErr(submissionsResult)) {
      return Result.err(new ListFormSubmissionsRepositoryError(submissionsResult.error))
    }

    return Result.ok(submissionsResult.value)
  }
}
