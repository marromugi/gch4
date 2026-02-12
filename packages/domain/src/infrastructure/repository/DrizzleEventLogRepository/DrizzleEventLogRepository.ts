import { eq } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import { eventLog } from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { EventLog } from '../../../domain/entity/EventLog/EventLog'
import { EventLogId } from '../../../domain/valueObject/EventLogId/EventLogId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { EventType } from '../../../domain/valueObject/EventType/EventType'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'

export class DrizzleEventLogRepository implements IEventLogRepository {
  constructor(private readonly db: Database) {}

  async create(entity: EventLog): Promise<Result<void, Error>> {
    try {
      await this.db.insert(eventLog).values({
        id: entity.id.value,
        jobId: entity.jobId?.value ?? null,
        applicationId: entity.applicationId?.value ?? null,
        chatSessionId: entity.chatSessionId?.value ?? null,
        policyVersionId: entity.policyVersionId?.value ?? null,
        eventType: entity.eventType.value,
        metadata: entity.metadata,
        createdAt: entity.createdAt,
      })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByJobId(jobId: JobId): Promise<Result<EventLog[], Error>> {
    try {
      const rows = await this.db.select().from(eventLog).where(eq(eventLog.jobId, jobId.value))
      return Result.ok(rows.map((row) => this.toEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByApplicationId(applicationId: ApplicationId): Promise<Result<EventLog[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(eventLog)
        .where(eq(eventLog.applicationId, applicationId.value))
      return Result.ok(rows.map((row) => this.toEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private toEntity(row: typeof eventLog.$inferSelect): EventLog {
    return EventLog.reconstruct({
      id: EventLogId.fromString(row.id),
      jobId: row.jobId ? JobId.fromString(row.jobId) : null,
      applicationId: row.applicationId ? ApplicationId.fromString(row.applicationId) : null,
      chatSessionId: row.chatSessionId ? ChatSessionId.fromString(row.chatSessionId) : null,
      policyVersionId: row.policyVersionId
        ? ReviewPolicyVersionId.fromString(row.policyVersionId)
        : null,
      eventType: EventType.from(row.eventType),
      metadata: row.metadata,
      createdAt: row.createdAt,
    })
  }
}
