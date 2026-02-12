import { eq } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import { interviewFeedback } from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { InterviewFeedback } from '../../../domain/entity/InterviewFeedback/InterviewFeedback'
import { InterviewFeedbackId } from '../../../domain/valueObject/InterviewFeedbackId/InterviewFeedbackId'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { IInterviewFeedbackRepository } from '../../../domain/repository/IInterviewFeedbackRepository/IInterviewFeedbackRepository'

export class DrizzleInterviewFeedbackRepository implements IInterviewFeedbackRepository {
  constructor(private readonly db: Database) {}

  async findById(id: InterviewFeedbackId): Promise<Result<InterviewFeedback, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(interviewFeedback)
        .where(eq(interviewFeedback.id, id.value))
        .limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`InterviewFeedback not found: ${id.value}`))
      }
      return Result.ok(this.toEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByApplicationId(
    applicationId: ApplicationId
  ): Promise<Result<InterviewFeedback[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(interviewFeedback)
        .where(eq(interviewFeedback.applicationId, applicationId.value))
      return Result.ok(rows.map((row) => this.toEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async save(entity: InterviewFeedback): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(interviewFeedback)
        .values({
          id: entity.id.value,
          applicationId: entity.applicationId.value,
          chatSessionId: entity.chatSessionId.value,
          policyVersionId: entity.policyVersionId.value,
          structuredData: entity.structuredData,
          structuredSchemaVersion: entity.structuredSchemaVersion,
          summaryConfirmedAt: entity.summaryConfirmedAt,
          submittedAt: entity.submittedAt,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        })
        .onConflictDoUpdate({
          target: interviewFeedback.id,
          set: {
            structuredData: entity.structuredData,
            structuredSchemaVersion: entity.structuredSchemaVersion,
            summaryConfirmedAt: entity.summaryConfirmedAt,
            submittedAt: entity.submittedAt,
            updatedAt: entity.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private toEntity(row: typeof interviewFeedback.$inferSelect): InterviewFeedback {
    return InterviewFeedback.reconstruct({
      id: InterviewFeedbackId.fromString(row.id),
      applicationId: ApplicationId.fromString(row.applicationId),
      chatSessionId: ChatSessionId.fromString(row.chatSessionId),
      policyVersionId: ReviewPolicyVersionId.fromString(row.policyVersionId),
      structuredData: row.structuredData,
      structuredSchemaVersion: row.structuredSchemaVersion,
      summaryConfirmedAt: row.summaryConfirmedAt,
      submittedAt: row.submittedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
