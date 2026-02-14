import { eq, and } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import {
  application,
  applicationTodo,
  extractedField,
  consentLog,
  chatSession,
  chatMessage,
} from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationTodo } from '../../../domain/entity/ApplicationTodo/ApplicationTodo'
import { ExtractedField } from '../../../domain/entity/ExtractedField/ExtractedField'
import { ConsentLog } from '../../../domain/entity/ConsentLog/ConsentLog'
import { ChatSession } from '../../../domain/entity/ChatSession/ChatSession'
import { ChatMessage } from '../../../domain/entity/ChatMessage/ChatMessage'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import { ApplicationTodoId } from '../../../domain/valueObject/ApplicationTodoId/ApplicationTodoId'
import { FieldFactDefinitionId } from '../../../domain/valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { TodoStatus } from '../../../domain/valueObject/TodoStatus/TodoStatus'
import { ExtractedFieldId } from '../../../domain/valueObject/ExtractedFieldId/ExtractedFieldId'
import { ExtractedFieldSource } from '../../../domain/valueObject/ExtractedFieldSource/ExtractedFieldSource'
import { ConsentLogId } from '../../../domain/valueObject/ConsentLogId/ConsentLogId'
import { ConsentType } from '../../../domain/valueObject/ConsentType/ConsentType'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { ChatSessionType } from '../../../domain/valueObject/ChatSessionType/ChatSessionType'
import { ChatSessionStatus } from '../../../domain/valueObject/ChatSessionStatus/ChatSessionStatus'
import { ChatMessageId } from '../../../domain/valueObject/ChatMessageId/ChatMessageId'
import { ChatMessageRole } from '../../../domain/valueObject/ChatMessageRole/ChatMessageRole'
import { ReviewPolicySignalId } from '../../../domain/valueObject/ReviewPolicySignalId/ReviewPolicySignalId'
import { AgentType } from '../../../domain/valueObject/AgentType/AgentType'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'

export class DrizzleApplicationRepository implements IApplicationRepository {
  constructor(private readonly db: Database) {}

  async findById(id: ApplicationId): Promise<Result<Application, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(application)
        .where(eq(application.id, id.value))
        .limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`Application not found: ${id.value}`))
      }
      return Result.ok(this.toApplicationEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByJobId(jobId: JobId): Promise<Result<Application[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(application)
        .where(eq(application.jobId, jobId.value))
      return Result.ok(rows.map((row) => this.toApplicationEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByJobIdAndStatus(
    jobId: JobId,
    status: ApplicationStatus
  ): Promise<Result<Application[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(application)
        .where(and(eq(application.jobId, jobId.value), eq(application.status, status.value)))
      return Result.ok(rows.map((row) => this.toApplicationEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async save(entity: Application): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(application)
        .values({
          id: entity.id.value,
          jobId: entity.jobId.value,
          schemaVersionId: entity.schemaVersionId.value,
          applicantName: entity.applicantName,
          applicantEmail: entity.applicantEmail,
          language: entity.language,
          country: entity.country,
          timezone: entity.timezone,
          status: entity.status.value,
          meetLink: entity.meetLink,
          extractionReviewedAt: entity.extractionReviewedAt,
          consentCheckedAt: entity.consentCheckedAt,
          submittedAt: entity.submittedAt,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        })
        .onConflictDoUpdate({
          target: application.id,
          set: {
            applicantName: entity.applicantName,
            applicantEmail: entity.applicantEmail,
            language: entity.language,
            country: entity.country,
            timezone: entity.timezone,
            status: entity.status.value,
            meetLink: entity.meetLink,
            extractionReviewedAt: entity.extractionReviewedAt,
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

  async delete(id: ApplicationId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(application).where(eq(application.id, id.value))
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ApplicationTodo

  async findTodosByApplicationId(
    applicationId: ApplicationId
  ): Promise<Result<ApplicationTodo[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(applicationTodo)
        .where(eq(applicationTodo.applicationId, applicationId.value))
      return Result.ok(rows.map((row) => this.toTodoEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveTodo(todo: ApplicationTodo): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(applicationTodo)
        .values({
          id: todo.id.value,
          applicationId: todo.applicationId.value,
          fieldFactDefinitionId: todo.fieldFactDefinitionId.value,
          jobFormFieldId: todo.jobFormFieldId.value,
          fact: todo.fact,
          doneCriteria: todo.doneCriteria,
          required: todo.required,
          status: todo.status.value,
          extractedValue: todo.extractedValue,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
        })
        .onConflictDoUpdate({
          target: applicationTodo.id,
          set: {
            status: todo.status.value,
            extractedValue: todo.extractedValue,
            updatedAt: todo.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveTodos(todos: ApplicationTodo[]): Promise<Result<void, Error>> {
    try {
      for (const todo of todos) {
        const result = await this.saveTodo(todo)
        if (!result.success) return result
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ExtractedField

  async findExtractedFieldsByApplicationId(
    applicationId: ApplicationId
  ): Promise<Result<ExtractedField[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(extractedField)
        .where(eq(extractedField.applicationId, applicationId.value))
      return Result.ok(rows.map((row) => this.toExtractedFieldEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveExtractedField(field: ExtractedField): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(extractedField)
        .values({
          id: field.id.value,
          applicationId: field.applicationId.value,
          jobFormFieldId: field.jobFormFieldId.value,
          value: field.value,
          source: field.source.value,
          confirmed: field.confirmed,
          createdAt: field.createdAt,
          updatedAt: field.updatedAt,
        })
        .onConflictDoUpdate({
          target: extractedField.id,
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

  async saveExtractedFields(fields: ExtractedField[]): Promise<Result<void, Error>> {
    try {
      for (const field of fields) {
        const result = await this.saveExtractedField(field)
        if (!result.success) return result
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ConsentLog

  async findConsentLogsByApplicationId(
    applicationId: ApplicationId
  ): Promise<Result<ConsentLog[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(consentLog)
        .where(eq(consentLog.applicationId, applicationId.value))
      return Result.ok(rows.map((row) => this.toConsentLogEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveConsentLog(log: ConsentLog): Promise<Result<void, Error>> {
    try {
      await this.db.insert(consentLog).values({
        id: log.id.value,
        applicationId: log.applicationId.value,
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

  async findChatSessionsByApplicationId(
    applicationId: ApplicationId
  ): Promise<Result<ChatSession[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(chatSession)
        .where(eq(chatSession.applicationId, applicationId.value))
      return Result.ok(rows.map((row) => this.toChatSessionEntity(row)))
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
          applicationId: session.applicationId?.value ?? null,
          jobId: session.jobId?.value ?? null,
          policyVersionId: session.policyVersionId?.value ?? null,
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
        targetJobFormFieldId: message.targetJobFormFieldId?.value ?? null,
        targetReviewSignalId: message.targetReviewSignalId?.value ?? null,
        reviewPassed: message.reviewPassed,
        createdAt: message.createdAt,
      })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Mappers

  private toApplicationEntity(row: typeof application.$inferSelect): Application {
    return Application.reconstruct({
      id: ApplicationId.fromString(row.id),
      jobId: JobId.fromString(row.jobId),
      schemaVersionId: JobSchemaVersionId.fromString(row.schemaVersionId),
      applicantName: row.applicantName,
      applicantEmail: row.applicantEmail,
      language: row.language,
      country: row.country,
      timezone: row.timezone,
      status: ApplicationStatus.from(row.status),
      meetLink: row.meetLink,
      extractionReviewedAt: row.extractionReviewedAt,
      consentCheckedAt: row.consentCheckedAt,
      submittedAt: row.submittedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toTodoEntity(row: typeof applicationTodo.$inferSelect): ApplicationTodo {
    return ApplicationTodo.reconstruct({
      id: ApplicationTodoId.fromString(row.id),
      applicationId: ApplicationId.fromString(row.applicationId),
      fieldFactDefinitionId: FieldFactDefinitionId.fromString(row.fieldFactDefinitionId),
      jobFormFieldId: JobFormFieldId.fromString(row.jobFormFieldId),
      fact: row.fact,
      doneCriteria: row.doneCriteria,
      required: row.required,
      status: TodoStatus.from(row.status),
      extractedValue: row.extractedValue,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toExtractedFieldEntity(row: typeof extractedField.$inferSelect): ExtractedField {
    return ExtractedField.reconstruct({
      id: ExtractedFieldId.fromString(row.id),
      applicationId: ApplicationId.fromString(row.applicationId),
      jobFormFieldId: JobFormFieldId.fromString(row.jobFormFieldId),
      value: row.value,
      source: ExtractedFieldSource.from(row.source),
      confirmed: row.confirmed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toConsentLogEntity(row: typeof consentLog.$inferSelect): ConsentLog {
    return ConsentLog.reconstruct({
      id: ConsentLogId.fromString(row.id),
      applicationId: ApplicationId.fromString(row.applicationId),
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
      applicationId: row.applicationId ? ApplicationId.fromString(row.applicationId) : null,
      jobId: row.jobId ? JobId.fromString(row.jobId) : null,
      policyVersionId: row.policyVersionId
        ? ReviewPolicyVersionId.fromString(row.policyVersionId)
        : null,
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
      targetJobFormFieldId: row.targetJobFormFieldId
        ? JobFormFieldId.fromString(row.targetJobFormFieldId)
        : null,
      targetReviewSignalId: row.targetReviewSignalId
        ? ReviewPolicySignalId.fromString(row.targetReviewSignalId)
        : null,
      reviewPassed: row.reviewPassed,
      createdAt: row.createdAt,
    })
  }
}
