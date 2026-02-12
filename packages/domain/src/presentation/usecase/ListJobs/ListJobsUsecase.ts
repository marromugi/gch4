import { Result } from '../../../domain/shared/Result/Result'
import type { Job } from '../../../domain/entity/Job/Job'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

// --- Error ---

export class ListJobsValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'ListJobsValidationError'
  }
}

export class ListJobsRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'ListJobsRepositoryError'
  }
}

export type ListJobsError = ListJobsValidationError | ListJobsRepositoryError

// --- Input / Output ---

export interface ListJobsInput {
  userId: string
}

export interface ListJobsDeps {
  jobRepository: IJobRepository
}

export type ListJobsOutput = Job[]

// --- Usecase ---

export class ListJobsUsecase {
  constructor(private readonly deps: ListJobsDeps) {}

  async execute(input: ListJobsInput): Promise<Result<ListJobsOutput, ListJobsError>> {
    if (!input.userId || input.userId.trim().length === 0) {
      return Result.err(new ListJobsValidationError(['userId is required']))
    }

    const userId = UserId.fromString(input.userId)

    const result = await this.deps.jobRepository.findByCreatedBy(userId)
    if (Result.isErr(result)) {
      return Result.err(new ListJobsRepositoryError(result.error))
    }

    return Result.ok(result.value)
  }
}
