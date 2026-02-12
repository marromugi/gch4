import { Result } from '../../../domain/shared/Result/Result'
import type { InterviewFeedback } from '../../../domain/entity/InterviewFeedback/InterviewFeedback'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import type { IInterviewFeedbackRepository } from '../../../domain/repository/IInterviewFeedbackRepository/IInterviewFeedbackRepository'

export class GetInterviewFeedbackValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'GetInterviewFeedbackValidationError'
  }
}

export class GetInterviewFeedbackFetchError extends Error {
  readonly type = 'fetch_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'GetInterviewFeedbackFetchError'
  }
}

export type GetInterviewFeedbackError =
  | GetInterviewFeedbackValidationError
  | GetInterviewFeedbackFetchError

export interface GetInterviewFeedbackInput {
  applicationId: string
}

export type GetInterviewFeedbackOutput = InterviewFeedback[] | null

export interface GetInterviewFeedbackDeps {
  interviewFeedbackRepository: IInterviewFeedbackRepository
}

export class GetInterviewFeedbackUsecase {
  constructor(private readonly deps: GetInterviewFeedbackDeps) {}

  async execute(
    input: GetInterviewFeedbackInput
  ): Promise<Result<GetInterviewFeedbackOutput, GetInterviewFeedbackError>> {
    if (!input.applicationId || input.applicationId.trim().length === 0) {
      return Result.err(new GetInterviewFeedbackValidationError(['applicationId is required']))
    }

    try {
      const applicationId = ApplicationId.fromString(input.applicationId)

      const result = await this.deps.interviewFeedbackRepository.findByApplicationId(applicationId)
      if (Result.isErr(result)) {
        return Result.err(new GetInterviewFeedbackFetchError(result.error))
      }

      const feedbacks = result.value
      if (feedbacks.length === 0) {
        return Result.ok(null)
      }

      return Result.ok(feedbacks)
    } catch (error) {
      return Result.err(
        new GetInterviewFeedbackValidationError([
          error instanceof Error ? error.message : 'Unknown error',
        ])
      )
    }
  }
}
