import { Result } from '../../../domain/shared/Result/Result'
import { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import { ReviewPolicySignal } from '../../../domain/entity/ReviewPolicySignal/ReviewPolicySignal'
import { ReviewProhibitedTopic } from '../../../domain/entity/ReviewProhibitedTopic/ReviewProhibitedTopic'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { ReviewPolicySignalId } from '../../../domain/valueObject/ReviewPolicySignalId/ReviewPolicySignalId'
import { ReviewPolicyVersionStatus } from '../../../domain/valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'
import { ReviewSignalPriority } from '../../../domain/valueObject/ReviewSignalPriority/ReviewSignalPriority'
import { ReviewSignalCategory } from '../../../domain/valueObject/ReviewSignalCategory/ReviewSignalCategory'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IReviewPolicyRepository } from '../../../domain/repository/IReviewPolicyRepository/IReviewPolicyRepository'

export class CreateReviewPolicyValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'CreateReviewPolicyValidationError'
  }
}

export class CreateReviewPolicySaveError extends Error {
  readonly type = 'save_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'CreateReviewPolicySaveError'
  }
}

export type CreateReviewPolicyError =
  | CreateReviewPolicyValidationError
  | CreateReviewPolicySaveError

export interface CreateReviewPolicySignalInput {
  label: string
  description: string | null
  priority: string
  category: string
}

export interface CreateReviewPolicyProhibitedTopicInput {
  topic: string
}

export interface CreateReviewPolicyInput {
  id: string
  jobId: string
  createdBy: string
  softCap: number
  hardCap: number
  signals: CreateReviewPolicySignalInput[]
  prohibitedTopics: CreateReviewPolicyProhibitedTopicInput[]
}

export interface CreateReviewPolicyOutput {
  policy: ReviewPolicyVersion
  signals: ReviewPolicySignal[]
  prohibitedTopics: ReviewProhibitedTopic[]
}

export interface CreateReviewPolicyDeps {
  reviewPolicyRepository: IReviewPolicyRepository
}

export class CreateReviewPolicyUsecase {
  constructor(private readonly deps: CreateReviewPolicyDeps) {}

  async execute(
    input: CreateReviewPolicyInput
  ): Promise<Result<CreateReviewPolicyOutput, CreateReviewPolicyError>> {
    const errors: string[] = []

    if (!input.id || input.id.trim().length === 0) {
      errors.push('id is required')
    }
    if (!input.jobId || input.jobId.trim().length === 0) {
      errors.push('jobId is required')
    }
    if (!input.createdBy || input.createdBy.trim().length === 0) {
      errors.push('createdBy is required')
    }
    if (input.signals.length === 0) {
      errors.push('At least one signal is required')
    }
    for (const signal of input.signals) {
      if (!signal.label || signal.label.trim().length === 0) {
        errors.push('Signal label is required')
      }
    }
    for (const topic of input.prohibitedTopics) {
      if (!topic.topic || topic.topic.trim().length === 0) {
        errors.push('Prohibited topic is required')
      }
    }

    if (errors.length > 0) {
      return Result.err(new CreateReviewPolicyValidationError(errors))
    }

    try {
      const policyVersionId = ReviewPolicyVersionId.fromString(input.id)
      const now = new Date()

      const policy = ReviewPolicyVersion.create({
        id: policyVersionId,
        jobId: JobId.fromString(input.jobId),
        version: 1,
        status: ReviewPolicyVersionStatus.draft(),
        softCap: input.softCap,
        hardCap: input.hardCap,
        createdBy: UserId.fromString(input.createdBy),
        confirmedAt: null,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      })

      const signals = input.signals.map((s, index) =>
        ReviewPolicySignal.create({
          id: ReviewPolicySignalId.fromString(`${input.id}-signal-${index}`),
          policyVersionId: policyVersionId,
          signalKey: `signal-${index}`,
          label: s.label,
          description: s.description,
          priority: ReviewSignalPriority.from(s.priority),
          category: ReviewSignalCategory.from(s.category),
          sortOrder: index,
          createdAt: now,
        })
      )

      const prohibitedTopics = input.prohibitedTopics.map((t, index) =>
        ReviewProhibitedTopic.create({
          id: `${input.id}-topic-${index}`,
          policyVersionId: policyVersionId,
          topic: t.topic,
          createdAt: now,
        })
      )

      const saveResult = await this.deps.reviewPolicyRepository.save(policy)
      if (Result.isErr(saveResult)) {
        return Result.err(new CreateReviewPolicySaveError(saveResult.error))
      }

      const saveSignalsResult = await this.deps.reviewPolicyRepository.saveSignals(signals)
      if (Result.isErr(saveSignalsResult)) {
        return Result.err(new CreateReviewPolicySaveError(saveSignalsResult.error))
      }

      if (prohibitedTopics.length > 0) {
        const saveTopicsResult =
          await this.deps.reviewPolicyRepository.saveProhibitedTopics(prohibitedTopics)
        if (Result.isErr(saveTopicsResult)) {
          return Result.err(new CreateReviewPolicySaveError(saveTopicsResult.error))
        }
      }

      return Result.ok({ policy, signals, prohibitedTopics })
    } catch (error) {
      return Result.err(
        new CreateReviewPolicyValidationError([
          error instanceof Error ? error.message : 'Unknown error',
        ])
      )
    }
  }
}
