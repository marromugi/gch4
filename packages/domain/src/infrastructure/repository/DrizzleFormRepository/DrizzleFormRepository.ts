import { eq, desc } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import { form, formField, formSchemaVersion, fieldCompletionCriteria } from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormField } from '../../../domain/entity/FormField/FormField'
import { FormSchemaVersion } from '../../../domain/entity/FormSchemaVersion/FormSchemaVersion'
import { FieldCompletionCriteria } from '../../../domain/entity/FieldCompletionCriteria/FieldCompletionCriteria'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { FormFieldId } from '../../../domain/valueObject/FormFieldId/FormFieldId'
import { FormSchemaVersionId } from '../../../domain/valueObject/FormSchemaVersionId/FormSchemaVersionId'
import { FormSchemaVersionStatus } from '../../../domain/valueObject/FormSchemaVersionStatus/FormSchemaVersionStatus'
import { FieldCompletionCriteriaId } from '../../../domain/valueObject/FieldCompletionCriteriaId/FieldCompletionCriteriaId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'

export class DrizzleFormRepository implements IFormRepository {
  constructor(private readonly db: Database) {}

  async findById(id: FormId): Promise<Result<Form, Error>> {
    try {
      const rows = await this.db.select().from(form).where(eq(form.id, id.value)).limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`Form not found: ${id.value}`))
      }
      return Result.ok(this.toFormEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findAll(): Promise<Result<Form[], Error>> {
    try {
      const rows = await this.db.select().from(form)
      return Result.ok(rows.map((row) => this.toFormEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findByUserId(userId: UserId): Promise<Result<Form[], Error>> {
    try {
      const rows = await this.db.select().from(form).where(eq(form.createdBy, userId.value))
      return Result.ok(rows.map((row) => this.toFormEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async save(entity: Form): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(form)
        .values({
          id: entity.id.value,
          title: entity.title,
          description: entity.description,
          purpose: entity.purpose,
          completionMessage: entity.completionMessage,
          status: entity.status.value,
          createdBy: entity.createdBy.value,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        })
        .onConflictDoUpdate({
          target: form.id,
          set: {
            title: entity.title,
            description: entity.description,
            purpose: entity.purpose,
            completionMessage: entity.completionMessage,
            status: entity.status.value,
            updatedAt: entity.updatedAt,
          },
        })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async delete(id: FormId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(form).where(eq(form.id, id.value))
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // FormField

  async findFormFieldsByFormId(formId: FormId): Promise<Result<FormField[], Error>> {
    try {
      const rows = await this.db.select().from(formField).where(eq(formField.formId, formId.value))
      return Result.ok(rows.map((row) => this.toFormFieldEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveFormField(field: FormField): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(formField)
        .values({
          id: field.id.value,
          formId: field.formId.value,
          fieldId: field.fieldId,
          label: field.label,
          description: field.description,
          intent: field.intent,
          required: field.required,
          sortOrder: field.sortOrder,
          createdAt: field.createdAt,
          updatedAt: field.updatedAt,
        })
        .onConflictDoUpdate({
          target: formField.id,
          set: {
            label: field.label,
            description: field.description,
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

  async saveFormFields(fields: FormField[]): Promise<Result<void, Error>> {
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

  async deleteFormFieldsByFormId(formId: FormId): Promise<Result<void, Error>> {
    try {
      await this.db.delete(formField).where(eq(formField.formId, formId.value))
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // FormSchemaVersion

  async findSchemaVersionById(id: FormSchemaVersionId): Promise<Result<FormSchemaVersion, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(formSchemaVersion)
        .where(eq(formSchemaVersion.id, id.value))
        .limit(1)
      if (rows.length === 0) {
        return Result.err(new Error(`FormSchemaVersion not found: ${id.value}`))
      }
      return Result.ok(this.toFormSchemaVersionEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findSchemaVersionsByFormId(formId: FormId): Promise<Result<FormSchemaVersion[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(formSchemaVersion)
        .where(eq(formSchemaVersion.formId, formId.value))
      return Result.ok(rows.map((row) => this.toFormSchemaVersionEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findLatestSchemaVersionByFormId(
    formId: FormId
  ): Promise<Result<FormSchemaVersion | null, Error>> {
    try {
      const rows = await this.db
        .select()
        .from(formSchemaVersion)
        .where(eq(formSchemaVersion.formId, formId.value))
        .orderBy(desc(formSchemaVersion.version))
        .limit(1)
      if (rows.length === 0) {
        return Result.ok(null)
      }
      return Result.ok(this.toFormSchemaVersionEntity(rows[0]))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveSchemaVersion(version: FormSchemaVersion): Promise<Result<void, Error>> {
    try {
      await this.db
        .insert(formSchemaVersion)
        .values({
          id: version.id.value,
          formId: version.formId.value,
          version: version.version,
          status: version.status.value,
          approvedAt: version.approvedAt,
          createdAt: version.createdAt,
        })
        .onConflictDoUpdate({
          target: formSchemaVersion.id,
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

  // FieldCompletionCriteria

  async findCompletionCriteriaBySchemaVersionId(
    schemaVersionId: FormSchemaVersionId
  ): Promise<Result<FieldCompletionCriteria[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(fieldCompletionCriteria)
        .where(eq(fieldCompletionCriteria.schemaVersionId, schemaVersionId.value))
      return Result.ok(rows.map((row) => this.toFieldCompletionCriteriaEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async saveCompletionCriteria(criteria: FieldCompletionCriteria[]): Promise<Result<void, Error>> {
    try {
      for (const c of criteria) {
        const boundariesJson = c.boundaries ? JSON.stringify(c.boundaries) : null
        await this.db
          .insert(fieldCompletionCriteria)
          .values({
            id: c.id.value,
            schemaVersionId: c.schemaVersionId.value,
            formFieldId: c.formFieldId.value,
            criteriaKey: c.criteriaKey,
            criteria: c.criteria,
            doneCondition: c.doneCondition,
            questioningHints: c.questioningHints,
            boundaries: boundariesJson,
            sortOrder: c.sortOrder,
            createdAt: c.createdAt,
          })
          .onConflictDoUpdate({
            target: fieldCompletionCriteria.id,
            set: {
              criteria: c.criteria,
              doneCondition: c.doneCondition,
              questioningHints: c.questioningHints,
              boundaries: boundariesJson,
              sortOrder: c.sortOrder,
            },
          })
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async deleteCompletionCriteriaBySchemaVersionId(
    schemaVersionId: FormSchemaVersionId
  ): Promise<Result<void, Error>> {
    try {
      await this.db
        .delete(fieldCompletionCriteria)
        .where(eq(fieldCompletionCriteria.schemaVersionId, schemaVersionId.value))
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // Mappers

  private toFormEntity(row: typeof form.$inferSelect): Form {
    return Form.reconstruct({
      id: FormId.fromString(row.id),
      title: row.title,
      description: row.description,
      purpose: row.purpose,
      completionMessage: row.completionMessage,
      status: FormStatus.from(row.status),
      createdBy: UserId.fromString(row.createdBy),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toFormFieldEntity(row: typeof formField.$inferSelect): FormField {
    return FormField.reconstruct({
      id: FormFieldId.fromString(row.id),
      formId: FormId.fromString(row.formId),
      fieldId: row.fieldId,
      label: row.label,
      description: row.description,
      intent: row.intent,
      required: row.required,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  private toFormSchemaVersionEntity(row: typeof formSchemaVersion.$inferSelect): FormSchemaVersion {
    return FormSchemaVersion.reconstruct({
      id: FormSchemaVersionId.fromString(row.id),
      formId: FormId.fromString(row.formId),
      version: row.version,
      status: FormSchemaVersionStatus.from(row.status),
      approvedAt: row.approvedAt,
      createdAt: row.createdAt,
    })
  }

  private toFieldCompletionCriteriaEntity(
    row: typeof fieldCompletionCriteria.$inferSelect
  ): FieldCompletionCriteria {
    let boundaries: string[] | null = null
    if (row.boundaries) {
      try {
        boundaries = JSON.parse(row.boundaries) as string[]
      } catch {
        boundaries = null
      }
    }
    return FieldCompletionCriteria.reconstruct({
      id: FieldCompletionCriteriaId.fromString(row.id),
      schemaVersionId: FormSchemaVersionId.fromString(row.schemaVersionId),
      formFieldId: FormFieldId.fromString(row.formFieldId),
      criteriaKey: row.criteriaKey,
      criteria: row.criteria,
      doneCondition: row.doneCondition,
      questioningHints: row.questioningHints ?? null,
      boundaries,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
    })
  }
}
