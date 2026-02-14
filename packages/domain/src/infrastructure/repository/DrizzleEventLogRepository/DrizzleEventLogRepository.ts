import { eq } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import { eventLog } from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { EventLog } from '../../../domain/entity/EventLog/EventLog'
import { EventLogId } from '../../../domain/valueObject/EventLogId/EventLogId'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { SubmissionId } from '../../../domain/valueObject/SubmissionId/SubmissionId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { EventType } from '../../../domain/valueObject/EventType/EventType'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'

export class DrizzleEventLogRepository implements IEventLogRepository {
  constructor(private readonly db: Database) {}

  async create(entity: EventLog): Promise<Result<void, Error>> {
    try {
      await this.db.insert(eventLog).values({
        id: entity.id.value,
        formId: entity.formId?.value ?? null,
        submissionId: entity.submissionId?.value ?? null,
        chatSessionId: entity.chatSessionId?.value ?? null,
        eventType: entity.eventType.value,
        metadata: entity.metadata,
        createdAt: entity.createdAt,
      })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByFormId(formId: FormId): Promise<Result<EventLog[], Error>> {
    try {
      const rows = await this.db.select().from(eventLog).where(eq(eventLog.formId, formId.value))
      return Result.ok(rows.map((row) => this.toEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findBySubmissionId(submissionId: SubmissionId): Promise<Result<EventLog[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(eventLog)
        .where(eq(eventLog.submissionId, submissionId.value))
      return Result.ok(rows.map((row) => this.toEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private toEntity(row: typeof eventLog.$inferSelect): EventLog {
    return EventLog.reconstruct({
      id: EventLogId.fromString(row.id),
      formId: row.formId ? FormId.fromString(row.formId) : null,
      submissionId: row.submissionId ? SubmissionId.fromString(row.submissionId) : null,
      chatSessionId: row.chatSessionId ? ChatSessionId.fromString(row.chatSessionId) : null,
      eventType: EventType.from(row.eventType),
      metadata: row.metadata,
      createdAt: row.createdAt,
    })
  }
}
