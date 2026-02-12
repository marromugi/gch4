import { Result } from '../../../domain/shared/Result/Result'
import type { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import type { ReviewPolicySignal } from '../../../domain/entity/ReviewPolicySignal/ReviewPolicySignal'
import type { ReviewProhibitedTopic } from '../../../domain/entity/ReviewProhibitedTopic/ReviewProhibitedTopic'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import type { IReviewPolicyRepository } from '../../../domain/repository/IReviewPolicyRepository/IReviewPolicyRepository'

export class GetReviewPolicyValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'GetReviewPolicyValidationError'
  }
}

export class GetReviewPolicyFetchError extends Error {
  readonly type = 'fetch_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'GetReviewPolicyFetchError'
  }
}

export type GetReviewPolicyError = GetReviewPolicyValidationError | GetReviewPolicyFetchError

export interface GetReviewPolicyInput {
  jobId: string
}

export interface GetReviewPolicyOutputData {
  policy: ReviewPolicyVersion
  signals: ReviewPolicySignal[]
  prohibitedTopics: ReviewProhibitedTopic[]
}

export type GetReviewPolicyOutput = GetReviewPolicyOutputData | null

export interface GetReviewPolicyDeps {
  reviewPolicyRepository: IReviewPolicyRepository
}

export class GetReviewPolicyUsecase {
  constructor(private readonly deps: GetReviewPolicyDeps) {}

  async execute(
    input: GetReviewPolicyInput
  ): Promise<Result<GetReviewPolicyOutput, GetReviewPolicyError>> {
    if (!input.jobId || input.jobId.trim().length === 0) {
      return Result.err(new GetReviewPolicyValidationError(['jobId is required']))
    }

    try {
      const jobId = JobId.fromString(input.jobId)

      const policiesResult = await this.deps.reviewPolicyRepository.findByJobId(jobId)
      if (Result.isErr(policiesResult)) {
        return Result.err(new GetReviewPolicyFetchError(policiesResult.error))
      }

      const policies = policiesResult.value
      if (policies.length === 0) {
        return Result.ok(null)
      }

      const latestPolicy = policies.reduce((latest, current) =>
        current.version > latest.version ? current : latest
      )

      const signalsResult = await this.deps.reviewPolicyRepository.findSignalsByPolicyVersionId(
        latestPolicy.id
      )
      if (Result.isErr(signalsResult)) {
        return Result.err(new GetReviewPolicyFetchError(signalsResult.error))
      }

      const topicsResult =
        await this.deps.reviewPolicyRepository.findProhibitedTopicsByPolicyVersionId(
          latestPolicy.id
        )
      if (Result.isErr(topicsResult)) {
        return Result.err(new GetReviewPolicyFetchError(topicsResult.error))
      }

      return Result.ok({
        policy: latestPolicy,
        signals: signalsResult.value,
        prohibitedTopics: topicsResult.value,
      })
    } catch (error) {
      return Result.err(
        new GetReviewPolicyValidationError([
          error instanceof Error ? error.message : 'Unknown error',
        ])
      )
    }
  }
}
