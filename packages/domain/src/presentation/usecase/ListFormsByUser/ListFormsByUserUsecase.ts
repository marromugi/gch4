import { Result } from '../../../domain/shared/Result/Result'
import type { Form } from '../../../domain/entity/Form/Form'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import type { ISubmissionRepository } from '../../../domain/repository/ISubmissionRepository/ISubmissionRepository'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class ListFormsByUserRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'ListFormsByUserRepositoryError'
  }
}

export type ListFormsByUserError = ListFormsByUserRepositoryError

// --- Input / Output ---

export interface ListFormsByUserInput {
  userId: string
}

export interface ListFormsByUserDeps {
  formRepository: IFormRepository
  submissionRepository: ISubmissionRepository
}

export interface FormWithSubmissionCount {
  form: Form
  submissionCount: number
}

export type ListFormsByUserOutput = FormWithSubmissionCount[]

// --- Usecase ---

export class ListFormsByUserUsecase {
  constructor(private readonly deps: ListFormsByUserDeps) {}

  async execute(
    input: ListFormsByUserInput
  ): Promise<Result<ListFormsByUserOutput, ListFormsByUserError>> {
    const userId = UserId.fromString(input.userId)

    const formsResult = await this.deps.formRepository.findByUserId(userId)
    if (Result.isErr(formsResult)) {
      return Result.err(new ListFormsByUserRepositoryError(formsResult.error))
    }

    const forms = formsResult.value
    if (forms.length === 0) {
      return Result.ok([])
    }

    const formIds = forms.map((f) => f.id)
    const countsResult = await this.deps.submissionRepository.countByFormIds(formIds)
    if (Result.isErr(countsResult)) {
      return Result.err(new ListFormsByUserRepositoryError(countsResult.error))
    }

    const countsMap = countsResult.value
    const output: FormWithSubmissionCount[] = forms.map((form) => ({
      form,
      submissionCount: countsMap.get(form.id.value) ?? 0,
    }))

    return Result.ok(output)
  }
}
