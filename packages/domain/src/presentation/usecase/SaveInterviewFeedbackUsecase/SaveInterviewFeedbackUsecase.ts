import { Result } from '../../../domain/shared/Result/Result'
import { InterviewFeedback } from '../../../domain/entity/InterviewFeedback/InterviewFeedback'
import { InterviewFeedbackId } from '../../../domain/valueObject/InterviewFeedbackId/InterviewFeedbackId'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { IInterviewFeedbackRepository } from '../../../domain/repository/IInterviewFeedbackRepository/IInterviewFeedbackRepository'

export class SaveInterviewFeedbackValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'SaveInterviewFeedbackValidationError'
  }
}

export class SaveInterviewFeedbackSaveError extends Error {
  readonly type = 'save_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'SaveInterviewFeedbackSaveError'
  }
}

export type SaveInterviewFeedbackError =
  | SaveInterviewFeedbackValidationError
  | SaveInterviewFeedbackSaveError

export interface SaveInterviewFeedbackInput {
  id: string
  applicationId: string
  chatSessionId: string
  policyVersionId: string
  structuredData: string | null
  structuredSchemaVersion: number
}

export type SaveInterviewFeedbackOutput = InterviewFeedback

export interface SaveInterviewFeedbackDeps {
  interviewFeedbackRepository: IInterviewFeedbackRepository
}

export class SaveInterviewFeedbackUsecase {
  constructor(private readonly deps: SaveInterviewFeedbackDeps) {}

  async execute(
    input: SaveInterviewFeedbackInput
  ): Promise<Result<SaveInterviewFeedbackOutput, SaveInterviewFeedbackError>> {
    const errors: string[] = []

    if (!input.id || input.id.trim().length === 0) {
      errors.push('id is required')
    }
    if (!input.applicationId || input.applicationId.trim().length === 0) {
      errors.push('applicationId is required')
    }
    if (!input.chatSessionId || input.chatSessionId.trim().length === 0) {
      errors.push('chatSessionId is required')
    }
    if (!input.policyVersionId || input.policyVersionId.trim().length === 0) {
      errors.push('policyVersionId is required')
    }

    if (errors.length > 0) {
      return Result.err(new SaveInterviewFeedbackValidationError(errors))
    }

    try {
      const now = new Date()

      const feedback = InterviewFeedback.create({
        id: InterviewFeedbackId.fromString(input.id),
        applicationId: ApplicationId.fromString(input.applicationId),
        chatSessionId: ChatSessionId.fromString(input.chatSessionId),
        policyVersionId: ReviewPolicyVersionId.fromString(input.policyVersionId),
        structuredData: input.structuredData,
        structuredSchemaVersion: input.structuredSchemaVersion,
        summaryConfirmedAt: null,
        submittedAt: null,
        createdAt: now,
        updatedAt: now,
      })

      const saveResult = await this.deps.interviewFeedbackRepository.save(feedback)
      if (Result.isErr(saveResult)) {
        return Result.err(new SaveInterviewFeedbackSaveError(saveResult.error))
      }

      return Result.ok(feedback)
    } catch (error) {
      return Result.err(
        new SaveInterviewFeedbackValidationError([
          error instanceof Error ? error.message : 'Unknown error',
        ])
      )
    }
  }
}
