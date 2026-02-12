import { eq, desc } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import {
  job,
  jobFormField,
  jobSchemaVersion,
  fieldFactDefinition,
  prohibitedTopic,
} from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { Job } from '../../../domain/entity/Job/Job'
import { JobFormField } from '../../../domain/entity/JobFormField/JobFormField'
import { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import { FieldFactDefinition } from '../../../domain/entity/FieldFactDefinition/FieldFactDefinition'
import { ProhibitedTopic } from '../../../domain/entity/ProhibitedTopic/ProhibitedTopic'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobSchemaVersionStatus } from '../../../domain/valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'
import { FieldFactDefinitionId } from '../../../domain/valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'

export class DrizzleJobRepository implements IJobRepository {
  constructor(private readonly db: Database) {}

  async findById(id: JobId): Promise<Result<Job, Error>> {
    try {
      const rows = await this.db.select().from(job).where(eq(job.id, id.value)).limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`Job not found: ${id.value}`))
      }
      return Result.ok(this.toJobEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByCreatedBy(userId: UserId): Promise<Result<Job[], Error>> {
    try {
      const rows = await this.db.select().from(job).where(eq(job.createdBy, userId.value))
      return Result.ok(rows.map((row) => this.toJobEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async save(entity: Job): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(job)
        .values({
          id: entity.id.value,
          title: entity.title,
          description: entity.description,
          idealCandidate: entity.idealCandidate,
          cultureContext: entity.cultureContext,
          status: entity.status.value,
          createdBy: entity.createdBy.value,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        })
        .onConflictDoUpdate({
          target: job.id,
          set: {
            title: entity.title,
            description: entity.description,
            idealCandidate: entity.idealCandidate,
            cultureContext: entity.cultureContext,
            status: entity.status.value,
            updatedAt: entity.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async delete(id: JobId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(job).where(eq(job.id, id.value))
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // JobFormField

  async findFormFieldsByJobId(jobId: JobId): Promise<Result<JobFormField[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(jobFormField)
        .where(eq(jobFormField.jobId, jobId.value))
      return Result.ok(rows.map((row) => this.toJobFormFieldEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveFormField(field: JobFormField): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(jobFormField)
        .values({
          id: field.id.value,
          jobId: field.jobId.value,
          fieldId: field.fieldId,
          label: field.label,
          intent: field.intent,
          required: field.required,
          sortOrder: field.sortOrder,
          createdAt: field.createdAt,
          updatedAt: field.updatedAt,
        })
        .onConflictDoUpdate({
          target: jobFormField.id,
          set: {
            label: field.label,
            intent: field.intent,
            required: field.required,
            sortOrder: field.sortOrder,
            updatedAt: field.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveFormFields(fields: JobFormField[]): Promise<Result<void, Error>> {
    try {
      for (const field of fields) {
        const result = await this.saveFormField(field)
        if (!result.success) return result
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // JobSchemaVersion

  async findSchemaVersionsByJobId(jobId: JobId): Promise<Result<JobSchemaVersion[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(jobSchemaVersion)
        .where(eq(jobSchemaVersion.jobId, jobId.value))
      return Result.ok(rows.map((row) => this.toJobSchemaVersionEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findLatestSchemaVersion(jobId: JobId): Promise<Result<JobSchemaVersion | null, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(jobSchemaVersion)
        .where(eq(jobSchemaVersion.jobId, jobId.value))
        .orderBy(desc(jobSchemaVersion.version))
        .limit(1)
      if (rows.length === 0) {
        return Result.ok(null)
      }
      return Result.ok(this.toJobSchemaVersionEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveSchemaVersion(version: JobSchemaVersion): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(jobSchemaVersion)
        .values({
          id: version.id.value,
          jobId: version.jobId.value,
          version: version.version,
          status: version.status.value,
          approvedAt: version.approvedAt,
          createdAt: version.createdAt,
        })
        .onConflictDoUpdate({
          target: jobSchemaVersion.id,
          set: {
            status: version.status.value,
            approvedAt: version.approvedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // FieldFactDefinition

  async findFactDefinitionsBySchemaVersionId(
    schemaVersionId: JobSchemaVersionId
  ): Promise<Result<FieldFactDefinition[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(fieldFactDefinition)
        .where(eq(fieldFactDefinition.schemaVersionId, schemaVersionId.value))
      return Result.ok(rows.map((row) => this.toFieldFactDefinitionEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveFactDefinitions(definitions: FieldFactDefinition[]): Promise<Result<void, Error>> {
    try {
      for (const def of definitions) {
        await this.db
          .insert(fieldFactDefinition)
          .values({
            id: def.id.value,
            schemaVersionId: def.schemaVersionId.value,
            jobFormFieldId: def.jobFormFieldId.value,
            factKey: def.factKey,
            fact: def.fact,
            doneCriteria: def.doneCriteria,
            questioningHints: def.questioningHints,
            sortOrder: def.sortOrder,
            createdAt: def.createdAt,
          })
          .onConflictDoUpdate({
            target: fieldFactDefinition.id,
            set: {
              fact: def.fact,
              doneCriteria: def.doneCriteria,
              questioningHints: def.questioningHints,
              sortOrder: def.sortOrder,
            },
          })
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // ProhibitedTopic

  async findProhibitedTopicsBySchemaVersionId(
    schemaVersionId: JobSchemaVersionId
  ): Promise<Result<ProhibitedTopic[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(prohibitedTopic)
        .where(eq(prohibitedTopic.schemaVersionId, schemaVersionId.value))
      return Result.ok(rows.map((row) => this.toProhibitedTopicEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveProhibitedTopics(topics: ProhibitedTopic[]): Promise<Result<void, Error>> {
    try {
      for (const topic of topics) {
        await this.db
          .insert(prohibitedTopic)
          .values({
            id: topic.id,
            schemaVersionId: topic.schemaVersionId.value,
            jobFormFieldId: topic.jobFormFieldId.value,
            topic: topic.topic,
            createdAt: topic.createdAt,
          })
          .onConflictDoUpdate({
            target: prohibitedTopic.id,
            set: {
              topic: topic.topic,
            },
          })
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Mappers

  private toJobEntity(row: typeof job.$inferSelect): Job {
    return Job.reconstruct({
      id: JobId.fromString(row.id),
      title: row.title,
      description: row.description,
      idealCandidate: row.idealCandidate,
      cultureContext: row.cultureContext,
      status: JobStatus.from(row.status),
      createdBy: UserId.fromString(row.createdBy),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toJobFormFieldEntity(row: typeof jobFormField.$inferSelect): JobFormField {
    return JobFormField.reconstruct({
      id: JobFormFieldId.fromString(row.id),
      jobId: JobId.fromString(row.jobId),
      fieldId: row.fieldId,
      label: row.label,
      intent: row.intent,
      required: row.required,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toJobSchemaVersionEntity(row: typeof jobSchemaVersion.$inferSelect): JobSchemaVersion {
    return JobSchemaVersion.reconstruct({
      id: JobSchemaVersionId.fromString(row.id),
      jobId: JobId.fromString(row.jobId),
      version: row.version,
      status: JobSchemaVersionStatus.from(row.status),
      approvedAt: row.approvedAt,
      createdAt: row.createdAt,
    })
  }

  private toFieldFactDefinitionEntity(
    row: typeof fieldFactDefinition.$inferSelect
  ): FieldFactDefinition {
    return FieldFactDefinition.reconstruct({
      id: FieldFactDefinitionId.fromString(row.id),
      schemaVersionId: JobSchemaVersionId.fromString(row.schemaVersionId),
      jobFormFieldId: JobFormFieldId.fromString(row.jobFormFieldId),
      factKey: row.factKey,
      fact: row.fact,
      doneCriteria: row.doneCriteria,
      questioningHints: row.questioningHints ?? null,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
    })
  }

  private toProhibitedTopicEntity(row: typeof prohibitedTopic.$inferSelect): ProhibitedTopic {
    return ProhibitedTopic.reconstruct({
      id: row.id,
      schemaVersionId: JobSchemaVersionId.fromString(row.schemaVersionId),
      jobFormFieldId: JobFormFieldId.fromString(row.jobFormFieldId),
      topic: row.topic,
      createdAt: row.createdAt,
    })
  }
}
