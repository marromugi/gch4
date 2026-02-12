import { Result } from '../../../domain/shared/Result/Result'
import type { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'

export class GetApplicationRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'GetApplicationRepositoryError'
  }
}

export type GetApplicationError = GetApplicationRepositoryError

export interface GetApplicationInput {
  applicationId: string
}

export type GetApplicationOutput = Application

export interface GetApplicationDeps {
  applicationRepository: IApplicationRepository
}

export class GetApplicationUsecase {
  constructor(private readonly deps: GetApplicationDeps) {}

  async execute(
    input: GetApplicationInput
  ): Promise<Result<GetApplicationOutput, GetApplicationError>> {
    const applicationId = ApplicationId.fromString(input.applicationId)

    const result = await this.deps.applicationRepository.findById(applicationId)
    if (!result.success) {
      return Result.err(new GetApplicationRepositoryError(result.error.message))
    }

    return Result.ok(result.value)
  }
}
