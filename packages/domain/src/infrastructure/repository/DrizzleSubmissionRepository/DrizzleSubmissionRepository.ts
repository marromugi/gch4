import { eq, and, inArray, sql } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import {
  submission,
  submissionTask,
  collectedField,
  consentLog,
  chatSession,
  chatMessage,
} from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { Submission } from '../../../domain/entity/Submission/Submission'
import { SubmissionTask } from '../../../domain/entity/SubmissionTask/SubmissionTask'
import { CollectedField } from '../../../domain/entity/CollectedField/CollectedField'
import { ConsentLog } from '../../../domain/entity/ConsentLog/ConsentLog'
import { ChatSession } from '../../../domain/entity/ChatSession/ChatSession'
import { ChatMessage } from '../../../domain/entity/ChatMessage/ChatMessage'
import { SubmissionId } from '../../../domain/valueObject/SubmissionId/SubmissionId'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormSchemaVersionId } from '../../../domain/valueObject/FormSchemaVersionId/FormSchemaVersionId'
import { SubmissionStatus } from '../../../domain/valueObject/SubmissionStatus/SubmissionStatus'
import { SubmissionTaskId } from '../../../domain/valueObject/SubmissionTaskId/SubmissionTaskId'
import { FieldCompletionCriteriaId } from '../../../domain/valueObject/FieldCompletionCriteriaId/FieldCompletionCriteriaId'
import { FormFieldId } from '../../../domain/valueObject/FormFieldId/FormFieldId'
import { TodoStatus } from '../../../domain/valueObject/TodoStatus/TodoStatus'
import { CollectedFieldId } from '../../../domain/valueObject/CollectedFieldId/CollectedFieldId'
import { CollectedFieldSource } from '../../../domain/valueObject/CollectedFieldSource/CollectedFieldSource'
import { ConsentLogId } from '../../../domain/valueObject/ConsentLogId/ConsentLogId'
import { ConsentType } from '../../../domain/valueObject/ConsentType/ConsentType'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { ChatSessionType } from '../../../domain/valueObject/ChatSessionType/ChatSessionType'
import { ChatSessionStatus } from '../../../domain/valueObject/ChatSessionStatus/ChatSessionStatus'
import { ChatMessageId } from '../../../domain/valueObject/ChatMessageId/ChatMessageId'
import { ChatMessageRole } from '../../../domain/valueObject/ChatMessageRole/ChatMessageRole'
import { AgentType } from '../../../domain/valueObject/AgentType/AgentType'
import type { ISubmissionRepository } from '../../../domain/repository/ISubmissionRepository/ISubmissionRepository'

export class DrizzleSubmissionRepository implements ISubmissionRepository {
  constructor(private readonly db: Database) {}

  async findById(id: SubmissionId): Promise<Result<Submission, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(submission)
        .where(eq(submission.id, id.value))
        .limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`Submission not found: ${id.value}`))
      }
      return Result.ok(this.toSubmissionEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByFormId(formId: FormId): Promise<Result<Submission[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(submission)
        .where(eq(submission.formId, formId.value))
      return Result.ok(rows.map((row) => this.toSubmissionEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByFormIdAndStatus(
    formId: FormId,
    status: SubmissionStatus
  ): Promise<Result<Submission[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(submission)
        .where(and(eq(submission.formId, formId.value), eq(submission.status, status.value)))
      return Result.ok(rows.map((row) => this.toSubmissionEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async countByFormIds(formIds: FormId[]): Promise<Result<Map<string, number>, Error>> {
    try {
      if (formIds.length === 0) {
        return Result.ok(new Map())
      }
      const rows = await this.db
        .select({
          formId: submission.formId,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(submission)
        .where(
          inArray(
            submission.formId,
            formIds.map((id) => id.value)
          )
        )
        .groupBy(submission.formId)

      const countMap = new Map<string, number>()
      for (const row of rows) {
        countMap.set(row.formId, row.count)
      }
      return Result.ok(countMap)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async save(entity: Submission): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(submission)
        .values({
          id: entity.id.value,
          formId: entity.formId.value,
          schemaVersionId: entity.schemaVersionId.value,
          respondentName: entity.respondentName,
          respondentEmail: entity.respondentEmail,
          language: entity.language,
          status: entity.status.value,
          reviewCompletedAt: entity.reviewCompletedAt,
          consentCheckedAt: entity.consentCheckedAt,
          submittedAt: entity.submittedAt,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        })
        .onConflictDoUpdate({
          target: submission.id,
          set: {
            respondentName: entity.respondentName,
            respondentEmail: entity.respondentEmail,
            language: entity.language,
            status: entity.status.value,
            reviewCompletedAt: entity.reviewCompletedAt,
            consentCheckedAt: entity.consentCheckedAt,
            submittedAt: entity.submittedAt,
            updatedAt: entity.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async delete(id: SubmissionId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(submission).where(eq(submission.id, id.value))
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // SubmissionTask

  async findTasksBySubmissionId(
    submissionId: SubmissionId
  ): Promise<Result<SubmissionTask[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(submissionTask)
        .where(eq(submissionTask.submissionId, submissionId.value))
      return Result.ok(rows.map((row) => this.toTaskEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveTask(task: SubmissionTask): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(submissionTask)
        .values({
          id: task.id.value,
          submissionId: task.submissionId.value,
          fieldCompletionCriteriaId: task.fieldCompletionCriteriaId.value,
          formFieldId: task.formFieldId.value,
          criteria: task.criteria,
          doneCondition: task.doneCondition,
          required: task.required,
          status: task.status.value,
          collectedValue: task.collectedValue,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })
        .onConflictDoUpdate({
          target: submissionTask.id,
          set: {
            status: task.status.value,
            collectedValue: task.collectedValue,
            updatedAt: task.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveTasks(tasks: SubmissionTask[]): Promise<Result<void, Error>> {
    try {
      for (const task of tasks) {
        const result = await this.saveTask(task)
        if (!result.success) return result
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // CollectedField

  async findCollectedFieldById(id: CollectedFieldId): Promise<Result<CollectedField, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(collectedField)
        .where(eq(collectedField.id, id.value))
        .limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`CollectedField not found: ${id.value}`))
      }
      return Result.ok(this.toCollectedFieldEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findCollectedFieldsBySubmissionId(
    submissionId: SubmissionId
  ): Promise<Result<CollectedField[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(collectedField)
        .where(eq(collectedField.submissionId, submissionId.value))
      return Result.ok(rows.map((row) => this.toCollectedFieldEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveCollectedField(field: CollectedField): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(collectedField)
        .values({
          id: field.id.value,
          submissionId: field.submissionId.value,
          formFieldId: field.formFieldId.value,
          value: field.value,
          source: field.source.value,
          confirmed: field.confirmed,
          createdAt: field.createdAt,
          updatedAt: field.updatedAt,
        })
        .onConflictDoUpdate({
          target: collectedField.id,
          set: {
            value: field.value,
            source: field.source.value,
            confirmed: field.confirmed,
            updatedAt: field.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveCollectedFields(fields: CollectedField[]): Promise<Result<void, Error>> {
    try {
      for (const field of fields) {
        const result = await this.saveCollectedField(field)
        if (!result.success) return result
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ConsentLog

  async findConsentLogsBySubmissionId(
    submissionId: SubmissionId
  ): Promise<Result<ConsentLog[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(consentLog)
        .where(eq(consentLog.submissionId, submissionId.value))
      return Result.ok(rows.map((row) => this.toConsentLogEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveConsentLog(log: ConsentLog): Promise<Result<void, Error>> {
    try {
      await this.db.insert(consentLog).values({
        id: log.id.value,
        submissionId: log.submissionId.value,
        consentType: log.consentType.value,
        consented: log.consented,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ChatSession

  async findChatSessionsBySubmissionId(
    submissionId: SubmissionId
  ): Promise<Result<ChatSession[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(chatSession)
        .where(eq(chatSession.submissionId, submissionId.value))
      return Result.ok(rows.map((row) => this.toChatSessionEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findChatSessionById(sessionId: ChatSessionId): Promise<Result<ChatSession, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(chatSession)
        .where(eq(chatSession.id, sessionId.value))
        .limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`ChatSession not found: ${sessionId.value}`))
      }
      return Result.ok(this.toChatSessionEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveChatSession(session: ChatSession): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(chatSession)
        .values({
          id: session.id.value,
          submissionId: session.submissionId?.value ?? null,
          formId: session.formId?.value ?? null,
          type: session.type.value,
          conductorId: session.conductorId?.value ?? null,
          bootstrapCompleted: session.bootstrapCompleted,
          status: session.status.value,
          turnCount: session.turnCount,
          softCap: session.softCap,
          hardCap: session.hardCap,
          softCappedAt: session.softCappedAt,
          hardCappedAt: session.hardCappedAt,
          reviewFailStreak: session.reviewFailStreak,
          extractionFailStreak: session.extractionFailStreak,
          timeoutStreak: session.timeoutStreak,
          currentAgent: session.currentAgent.value,
          plan: session.plan,
          planSchemaVersion: session.planSchemaVersion,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        })
        .onConflictDoUpdate({
          target: chatSession.id,
          set: {
            bootstrapCompleted: session.bootstrapCompleted,
            status: session.status.value,
            turnCount: session.turnCount,
            softCap: session.softCap,
            hardCap: session.hardCap,
            softCappedAt: session.softCappedAt,
            hardCappedAt: session.hardCappedAt,
            reviewFailStreak: session.reviewFailStreak,
            extractionFailStreak: session.extractionFailStreak,
            timeoutStreak: session.timeoutStreak,
            currentAgent: session.currentAgent.value,
            plan: session.plan,
            planSchemaVersion: session.planSchemaVersion,
            updatedAt: session.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ChatMessage

  async findChatMessagesBySessionId(
    sessionId: ChatSessionId
  ): Promise<Result<ChatMessage[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.chatSessionId, sessionId.value))
      return Result.ok(rows.map((row) => this.toChatMessageEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveChatMessage(message: ChatMessage): Promise<Result<void, Error>> {
    try {
      await this.db.insert(chatMessage).values({
        id: message.id.value,
        chatSessionId: message.chatSessionId.value,
        role: message.role.value,
        content: message.content,
        targetFormFieldId: message.targetFormFieldId?.value ?? null,
        reviewPassed: message.reviewPassed,
        createdAt: message.createdAt,
      })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Mappers

  private toSubmissionEntity(row: typeof submission.$inferSelect): Submission {
    return Submission.reconstruct({
      id: SubmissionId.fromString(row.id),
      formId: FormId.fromString(row.formId),
      schemaVersionId: FormSchemaVersionId.fromString(row.schemaVersionId),
      respondentName: row.respondentName,
      respondentEmail: row.respondentEmail,
      language: row.language,
      status: SubmissionStatus.from(row.status),
      reviewCompletedAt: row.reviewCompletedAt,
      consentCheckedAt: row.consentCheckedAt,
      submittedAt: row.submittedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toTaskEntity(row: typeof submissionTask.$inferSelect): SubmissionTask {
    return SubmissionTask.reconstruct({
      id: SubmissionTaskId.fromString(row.id),
      submissionId: SubmissionId.fromString(row.submissionId),
      fieldCompletionCriteriaId: FieldCompletionCriteriaId.fromString(
        row.fieldCompletionCriteriaId
      ),
      formFieldId: FormFieldId.fromString(row.formFieldId),
      criteria: row.criteria,
      doneCondition: row.doneCondition,
      required: row.required,
      status: TodoStatus.from(row.status),
      collectedValue: row.collectedValue,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toCollectedFieldEntity(row: typeof collectedField.$inferSelect): CollectedField {
    return CollectedField.reconstruct({
      id: CollectedFieldId.fromString(row.id),
      submissionId: SubmissionId.fromString(row.submissionId),
      formFieldId: FormFieldId.fromString(row.formFieldId),
      value: row.value,
      source: CollectedFieldSource.from(row.source),
      confirmed: row.confirmed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toConsentLogEntity(row: typeof consentLog.$inferSelect): ConsentLog {
    return ConsentLog.reconstruct({
      id: ConsentLogId.fromString(row.id),
      submissionId: SubmissionId.fromString(row.submissionId),
      consentType: ConsentType.from(row.consentType),
      consented: row.consented,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
    })
  }

  private toChatSessionEntity(row: typeof chatSession.$inferSelect): ChatSession {
    return ChatSession.reconstruct({
      id: ChatSessionId.fromString(row.id),
      submissionId: row.submissionId ? SubmissionId.fromString(row.submissionId) : null,
      formId: row.formId ? FormId.fromString(row.formId) : null,
      type: ChatSessionType.from(row.type),
      conductorId: row.conductorId ? UserId.fromString(row.conductorId) : null,
      bootstrapCompleted: row.bootstrapCompleted,
      status: ChatSessionStatus.from(row.status),
      turnCount: row.turnCount,
      softCap: row.softCap,
      hardCap: row.hardCap,
      softCappedAt: row.softCappedAt,
      hardCappedAt: row.hardCappedAt,
      reviewFailStreak: row.reviewFailStreak,
      extractionFailStreak: row.extractionFailStreak,
      timeoutStreak: row.timeoutStreak,
      currentAgent: AgentType.from(row.currentAgent),
      plan: row.plan,
      planSchemaVersion: row.planSchemaVersion,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toChatMessageEntity(row: typeof chatMessage.$inferSelect): ChatMessage {
    return ChatMessage.reconstruct({
      id: ChatMessageId.fromString(row.id),
      chatSessionId: ChatSessionId.fromString(row.chatSessionId),
      role: ChatMessageRole.from(row.role),
      content: row.content,
      targetFormFieldId: row.targetFormFieldId
        ? FormFieldId.fromString(row.targetFormFieldId)
        : null,
      reviewPassed: row.reviewPassed,
      createdAt: row.createdAt,
    })
  }
}
