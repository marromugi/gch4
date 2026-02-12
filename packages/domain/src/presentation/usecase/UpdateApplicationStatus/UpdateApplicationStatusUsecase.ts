import { Result } from '../../../domain/shared/Result/Result'
import type { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'

export class UpdateApplicationStatusRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'UpdateApplicationStatusRepositoryError'
  }
}

export class UpdateApplicationStatusTransitionError extends Error {
  readonly type = 'transition_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'UpdateApplicationStatusTransitionError'
  }
}

export type UpdateApplicationStatusError =
  | UpdateApplicationStatusRepositoryError
  | UpdateApplicationStatusTransitionError

export interface UpdateApplicationStatusInput {
  applicationId: string
  newStatus: string
}

export type UpdateApplicationStatusOutput = Application

export interface UpdateApplicationStatusDeps {
  applicationRepository: IApplicationRepository
}

export class UpdateApplicationStatusUsecase {
  constructor(private readonly deps: UpdateApplicationStatusDeps) {}

  async execute(
    input: UpdateApplicationStatusInput
  ): Promise<Result<UpdateApplicationStatusOutput, UpdateApplicationStatusError>> {
    const applicationId = ApplicationId.fromString(input.applicationId)

    let newStatus: ApplicationStatus
    try {
      newStatus = ApplicationStatus.from(input.newStatus)
    } catch (e) {
      return Result.err(
        new UpdateApplicationStatusTransitionError(`Invalid status: ${input.newStatus}`)
      )
    }

    const findResult = await this.deps.applicationRepository.findById(applicationId)
    if (!findResult.success) {
      return Result.err(new UpdateApplicationStatusRepositoryError(findResult.error.message))
    }

    let updatedApplication: Application
    try {
      updatedApplication = findResult.value.transitionTo(newStatus)
    } catch (e) {
      return Result.err(
        new UpdateApplicationStatusTransitionError(
          e instanceof Error ? e.message : 'Status transition failed'
        )
      )
    }

    const saveResult = await this.deps.applicationRepository.save(updatedApplication)
    if (!saveResult.success) {
      return Result.err(new UpdateApplicationStatusRepositoryError(saveResult.error.message))
    }

    return Result.ok(updatedApplication)
  }
}
