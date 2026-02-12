import { Result } from '../../../domain/shared/Result/Result'
import type { Job } from '../../../domain/entity/Job/Job'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

// --- Error ---

export class GetJobValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'GetJobValidationError'
  }
}

export class GetJobRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'GetJobRepositoryError'
  }
}

export type GetJobError = GetJobValidationError | GetJobRepositoryError

// --- Input / Output ---

export interface GetJobInput {
  jobId: string
}

export interface GetJobDeps {
  jobRepository: IJobRepository
}

export type GetJobOutput = Job

// --- Usecase ---

export class GetJobUsecase {
  constructor(private readonly deps: GetJobDeps) {}

  async execute(input: GetJobInput): Promise<Result<GetJobOutput, GetJobError>> {
    if (!input.jobId || input.jobId.trim().length === 0) {
      return Result.err(new GetJobValidationError(['jobId is required']))
    }

    const jobId = JobId.fromString(input.jobId)

    const result = await this.deps.jobRepository.findById(jobId)
    if (Result.isErr(result)) {
      return Result.err(new GetJobRepositoryError(result.error))
    }

    return Result.ok(result.value)
  }
}
