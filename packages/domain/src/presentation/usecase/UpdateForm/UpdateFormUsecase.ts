import { Result } from '../../../domain/shared/Result/Result'
import type { Form } from '../../../domain/entity/Form/Form'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class UpdateFormNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'UpdateFormNotFoundError'
  }
}

export class UpdateFormForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Only the owner can update this form')
    this.name = 'UpdateFormForbiddenError'
  }
}

export class UpdateFormRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'UpdateFormRepositoryError'
  }
}

export type UpdateFormError =
  | UpdateFormNotFoundError
  | UpdateFormForbiddenError
  | UpdateFormRepositoryError

// --- Input / Output ---

export interface UpdateFormInput {
  formId: string
  userId: string
  title?: string
  description?: string | null
  purpose?: string | null
  completionMessage?: string | null
}

export interface UpdateFormDeps {
  formRepository: IFormRepository
}

export type UpdateFormOutput = Form

// --- Usecase ---

export class UpdateFormUsecase {
  constructor(private readonly deps: UpdateFormDeps) {}

  async execute(input: UpdateFormInput): Promise<Result<UpdateFormOutput, UpdateFormError>> {
    const formId = FormId.fromString(input.formId)

    const findResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(findResult)) {
      return Result.err(new UpdateFormNotFoundError(input.formId))
    }

    let form = findResult.value

    // 権限チェック: 所有者のみ
    if (!form.createdBy.equals(UserId.fromString(input.userId))) {
      return Result.err(new UpdateFormForbiddenError())
    }

    // 更新処理
    if (input.title !== undefined) {
      form = form.updateTitle(input.title)
    }
    if (input.description !== undefined) {
      form = form.updateDescription(input.description)
    }
    if (input.purpose !== undefined) {
      form = form.updatePurpose(input.purpose)
    }
    if (input.completionMessage !== undefined) {
      form = form.updateCompletionMessage(input.completionMessage)
    }

    const saveResult = await this.deps.formRepository.save(form)
    if (Result.isErr(saveResult)) {
      return Result.err(new UpdateFormRepositoryError(saveResult.error))
    }

    return Result.ok(form)
  }
}
