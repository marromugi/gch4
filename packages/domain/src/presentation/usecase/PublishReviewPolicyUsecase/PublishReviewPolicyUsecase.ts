import { Result } from '../../../domain/shared/Result/Result'
import type { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { IReviewPolicyRepository } from '../../../domain/repository/IReviewPolicyRepository/IReviewPolicyRepository'

export class PublishReviewPolicyValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'PublishReviewPolicyValidationError'
  }
}

export class PublishReviewPolicyNotFoundError extends Error {
  readonly type = 'not_found_error' as const
  constructor(id: string) {
    super(`ReviewPolicyVersion not found: ${id}`)
    this.name = 'PublishReviewPolicyNotFoundError'
  }
}

export class PublishReviewPolicyStatusError extends Error {
  readonly type = 'status_error' as const
  constructor(currentStatus: string) {
    super(`Cannot publish policy in status: ${currentStatus}`)
    this.name = 'PublishReviewPolicyStatusError'
  }
}

export class PublishReviewPolicySaveError extends Error {
  readonly type = 'save_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'PublishReviewPolicySaveError'
  }
}

export type PublishReviewPolicyError =
  | PublishReviewPolicyValidationError
  | PublishReviewPolicyNotFoundError
  | PublishReviewPolicyStatusError
  | PublishReviewPolicySaveError

export interface PublishReviewPolicyInput {
  reviewPolicyVersionId: string
}

export type PublishReviewPolicyOutput = ReviewPolicyVersion

export interface PublishReviewPolicyDeps {
  reviewPolicyRepository: IReviewPolicyRepository
}

export class PublishReviewPolicyUsecase {
  constructor(private readonly deps: PublishReviewPolicyDeps) {}

  async execute(
    input: PublishReviewPolicyInput
  ): Promise<Result<PublishReviewPolicyOutput, PublishReviewPolicyError>> {
    if (!input.reviewPolicyVersionId || input.reviewPolicyVersionId.trim().length === 0) {
      return Result.err(
        new PublishReviewPolicyValidationError(['reviewPolicyVersionId is required'])
      )
    }

    try {
      const id = ReviewPolicyVersionId.fromString(input.reviewPolicyVersionId)

      const findResult = await this.deps.reviewPolicyRepository.findById(id)
      if (Result.isErr(findResult)) {
        return Result.err(new PublishReviewPolicyNotFoundError(input.reviewPolicyVersionId))
      }

      const policy = findResult.value

      if (!policy.status.isConfirmed()) {
        return Result.err(new PublishReviewPolicyStatusError(policy.status.value))
      }

      const publishedPolicy = policy.publish()

      const saveResult = await this.deps.reviewPolicyRepository.save(publishedPolicy)
      if (Result.isErr(saveResult)) {
        return Result.err(new PublishReviewPolicySaveError(saveResult.error))
      }

      return Result.ok(publishedPolicy)
    } catch (error) {
      return Result.err(
        new PublishReviewPolicyValidationError([
          error instanceof Error ? error.message : 'Unknown error',
        ])
      )
    }
  }
}
