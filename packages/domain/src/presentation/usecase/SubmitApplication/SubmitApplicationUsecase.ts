import { Result } from '../../../domain/shared/Result/Result'
import type { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import {
  ApplicationSubmissionService,
  type SubmissionError,
} from '../../../domain/service/ApplicationSubmissionService/ApplicationSubmissionService'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'

export class SubmitApplicationRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'SubmitApplicationRepositoryError'
  }
}

export class SubmitApplicationValidationError extends Error {
  readonly type = 'validation_error' as const
  readonly submissionError: SubmissionError
  constructor(submissionError: SubmissionError) {
    super(`Submission validation failed: ${submissionError.type}`)
    this.name = 'SubmitApplicationValidationError'
    this.submissionError = submissionError
  }
}

export type SubmitApplicationError =
  | SubmitApplicationRepositoryError
  | SubmitApplicationValidationError

export interface SubmitApplicationInput {
  applicationId: string
}

export type SubmitApplicationOutput = Application

export interface SubmitApplicationDeps {
  applicationRepository: IApplicationRepository
  submissionService: ApplicationSubmissionService
}

export class SubmitApplicationUsecase {
  constructor(private readonly deps: SubmitApplicationDeps) {}

  async execute(
    input: SubmitApplicationInput
  ): Promise<Result<SubmitApplicationOutput, SubmitApplicationError>> {
    const applicationId = ApplicationId.fromString(input.applicationId)

    // 応募を取得
    const findResult = await this.deps.applicationRepository.findById(applicationId)
    if (!findResult.success) {
      return Result.err(new SubmitApplicationRepositoryError(findResult.error.message))
    }
    const application = findResult.value

    // Todoを取得
    const todosResult =
      await this.deps.applicationRepository.findTodosByApplicationId(applicationId)
    if (!todosResult.success) {
      return Result.err(new SubmitApplicationRepositoryError(todosResult.error.message))
    }

    // ドメインサービスでバリデーション
    const validationResult = this.deps.submissionService.validate(application, todosResult.value)
    if (!validationResult.success) {
      return Result.err(new SubmitApplicationValidationError(validationResult.error))
    }

    // 応募確定
    const submittedApplication = application.submit()

    const saveResult = await this.deps.applicationRepository.save(submittedApplication)
    if (!saveResult.success) {
      return Result.err(new SubmitApplicationRepositoryError(saveResult.error.message))
    }

    return Result.ok(submittedApplication)
  }
}
