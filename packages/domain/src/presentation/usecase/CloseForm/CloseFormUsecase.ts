import { Result } from '../../../domain/shared/Result/Result'
import type { Form } from '../../../domain/entity/Form/Form'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class CloseFormNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'CloseFormNotFoundError'
  }
}

export class CloseFormForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Only the owner can close this form')
    this.name = 'CloseFormForbiddenError'
  }
}

export class CloseFormBusinessError extends Error {
  readonly type = 'business_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'CloseFormBusinessError'
  }
}

export class CloseFormRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'CloseFormRepositoryError'
  }
}

export type CloseFormError =
  | CloseFormNotFoundError
  | CloseFormForbiddenError
  | CloseFormBusinessError
  | CloseFormRepositoryError

// --- Input / Output ---

export interface CloseFormInput {
  formId: string
  userId: string
}

export interface CloseFormDeps {
  formRepository: IFormRepository
}

export type CloseFormOutput = Form

// --- Usecase ---

export class CloseFormUsecase {
  constructor(private readonly deps: CloseFormDeps) {}

  async execute(input: CloseFormInput): Promise<Result<CloseFormOutput, CloseFormError>> {
    const formId = FormId.fromString(input.formId)

    const findResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(findResult)) {
      return Result.err(new CloseFormNotFoundError(input.formId))
    }

    const form = findResult.value

    // 権限チェック: 所有者のみ
    if (!form.createdBy.equals(UserId.fromString(input.userId))) {
      return Result.err(new CloseFormForbiddenError())
    }

    // 状態遷移
    let closedForm: Form
    try {
      closedForm = form.close()
    } catch (e) {
      return Result.err(
        new CloseFormBusinessError(e instanceof Error ? e.message : 'Unknown error')
      )
    }

    const saveResult = await this.deps.formRepository.save(closedForm)
    if (Result.isErr(saveResult)) {
      return Result.err(new CloseFormRepositoryError(saveResult.error))
    }

    return Result.ok(closedForm)
  }
}
