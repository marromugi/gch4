import { Result } from '../../../domain/shared/Result/Result'
import type { Application } from '../../../domain/entity/Application/Application'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'

export class ListApplicationsRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'ListApplicationsRepositoryError'
  }
}

export type ListApplicationsError = ListApplicationsRepositoryError

export interface ListApplicationsInput {
  jobId: string
}

export type ListApplicationsOutput = Application[]

export interface ListApplicationsDeps {
  applicationRepository: IApplicationRepository
}

export class ListApplicationsUsecase {
  constructor(private readonly deps: ListApplicationsDeps) {}

  async execute(
    input: ListApplicationsInput
  ): Promise<Result<ListApplicationsOutput, ListApplicationsError>> {
    const jobId = JobId.fromString(input.jobId)

    const result = await this.deps.applicationRepository.findByJobId(jobId)
    if (!result.success) {
      return Result.err(new ListApplicationsRepositoryError(result.error.message))
    }

    return Result.ok(result.value)
  }
}
