import { Result } from '../../../domain/shared/Result/Result'
import type { Form } from '../../../domain/entity/Form/Form'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class PublishFormNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(formId: string) {
    super(`Form not found: ${formId}`)
    this.name = 'PublishFormNotFoundError'
  }
}

export class PublishFormForbiddenError extends Error {
  readonly type = 'forbidden_error' as const
  constructor() {
    super('Only the owner can publish this form')
    this.name = 'PublishFormForbiddenError'
  }
}

export class PublishFormBusinessError extends Error {
  readonly type = 'business_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'PublishFormBusinessError'
  }
}

export class PublishFormRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'PublishFormRepositoryError'
  }
}

export type PublishFormError =
  | PublishFormNotFoundError
  | PublishFormForbiddenError
  | PublishFormBusinessError
  | PublishFormRepositoryError

// --- Input / Output ---

export interface PublishFormInput {
  formId: string
  userId: string
}

export interface PublishFormDeps {
  formRepository: IFormRepository
}

export type PublishFormOutput = Form

// --- Usecase ---

export class PublishFormUsecase {
  constructor(private readonly deps: PublishFormDeps) {}

  async execute(input: PublishFormInput): Promise<Result<PublishFormOutput, PublishFormError>> {
    const formId = FormId.fromString(input.formId)

    const findResult = await this.deps.formRepository.findById(formId)
    if (Result.isErr(findResult)) {
      return Result.err(new PublishFormNotFoundError(input.formId))
    }

    const form = findResult.value

    // 権限チェック: 所有者のみ
    if (!form.createdBy.equals(UserId.fromString(input.userId))) {
      return Result.err(new PublishFormForbiddenError())
    }

    // 状態遷移
    let publishedForm: Form
    try {
      publishedForm = form.publish()
    } catch (e) {
      return Result.err(
        new PublishFormBusinessError(e instanceof Error ? e.message : 'Unknown error')
      )
    }

    const saveResult = await this.deps.formRepository.save(publishedForm)
    if (Result.isErr(saveResult)) {
      return Result.err(new PublishFormRepositoryError(saveResult.error))
    }

    return Result.ok(publishedForm)
  }
}
