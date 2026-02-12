import { Result } from '../../../domain/shared/Result/Result'
import { Job } from '../../../domain/entity/Job/Job'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

// --- Error ---

export class UpdateJobValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'UpdateJobValidationError'
  }
}

export class UpdateJobNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(jobId: string) {
    super(`Job not found: ${jobId}`)
    this.name = 'UpdateJobNotFoundError'
  }
}

export class UpdateJobRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'UpdateJobRepositoryError'
  }
}

export type UpdateJobError =
  | UpdateJobValidationError
  | UpdateJobNotFoundError
  | UpdateJobRepositoryError

// --- Input / Output ---

export interface UpdateJobInput {
  jobId: string
  title?: string
  idealCandidate?: string | null
  cultureContext?: string | null
}

export interface UpdateJobDeps {
  jobRepository: IJobRepository
}

export type UpdateJobOutput = Job

// --- Usecase ---

export class UpdateJobUsecase {
  constructor(private readonly deps: UpdateJobDeps) {}

  async execute(input: UpdateJobInput): Promise<Result<UpdateJobOutput, UpdateJobError>> {
    const validationErrors: string[] = []

    if (!input.jobId || input.jobId.trim().length === 0) {
      validationErrors.push('jobId is required')
    }

    if (input.title !== undefined && input.title.trim().length === 0) {
      validationErrors.push('title cannot be empty')
    }

    if (validationErrors.length > 0) {
      return Result.err(new UpdateJobValidationError(validationErrors))
    }

    const jobId = JobId.fromString(input.jobId)

    const findResult = await this.deps.jobRepository.findById(jobId)
    if (Result.isErr(findResult)) {
      return Result.err(new UpdateJobRepositoryError(findResult.error))
    }

    const existingJob = findResult.value
    if (!existingJob) {
      return Result.err(new UpdateJobNotFoundError(input.jobId))
    }

    const updatedJob = Job.reconstruct({
      id: existingJob.id,
      title: input.title !== undefined ? input.title : existingJob.title,
      description: existingJob.description,
      idealCandidate:
        input.idealCandidate !== undefined ? input.idealCandidate : existingJob.idealCandidate,
      cultureContext:
        input.cultureContext !== undefined ? input.cultureContext : existingJob.cultureContext,
      status: existingJob.status,
      createdBy: existingJob.createdBy,
      createdAt: existingJob.createdAt,
      updatedAt: new Date(),
    })

    const saveResult = await this.deps.jobRepository.save(updatedJob)
    if (Result.isErr(saveResult)) {
      return Result.err(new UpdateJobRepositoryError(saveResult.error))
    }

    return Result.ok(updatedJob)
  }
}
