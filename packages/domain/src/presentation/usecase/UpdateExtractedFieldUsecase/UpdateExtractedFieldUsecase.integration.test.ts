import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import {
  job,
  jobFormField as jobFormFieldTable,
  jobSchemaVersion,
  fieldFactDefinition as fieldFactDefinitionTable,
  application as applicationTable,
  extractedField as extractedFieldTable,
} from '@ding/database/schema'
import { DrizzleApplicationRepository } from '../../../infrastructure/repository/DrizzleApplicationRepository'
import { UpdateExtractedFieldUsecase } from './UpdateExtractedFieldUsecase'

describe('UpdateExtractedFieldUsecase', () => {
  let db: Database
  let usecase: UpdateExtractedFieldUsecase
  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'
  const appId = 'test-app-1'
  const efId = 'test-ef-1'

  beforeAll(() => {
    db = createTestDatabase()
    const applicationRepository = new DrizzleApplicationRepository(db)
    usecase = new UpdateExtractedFieldUsecase({ applicationRepository })
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    const now = new Date()
    await db.insert(job).values({
      id: jobIdVal,
      title: 'Test Job',
      status: 'draft',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(jobFormFieldTable).values({
      id: fieldId,
      jobId: jobIdVal,
      fieldId: 'name',
      label: 'Name',
      required: true,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(jobSchemaVersion).values({
      id: svId,
      jobId: jobIdVal,
      version: 1,
      status: 'draft',
      createdAt: now,
    })
    await db.insert(fieldFactDefinitionTable).values({
      id: ffdId,
      schemaVersionId: svId,
      jobFormFieldId: fieldId,
      factKey: 'full_name',
      fact: 'Full name',
      doneCriteria: 'Name provided',
      sortOrder: 0,
      createdAt: now,
    })
    await db.insert(applicationTable).values({
      id: appId,
      jobId: jobIdVal,
      schemaVersionId: svId,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    })
    // 事前にExtractedFieldを保存
    await db.insert(extractedFieldTable).values({
      id: efId,
      applicationId: appId,
      jobFormFieldId: fieldId,
      value: 'Original Value',
      source: 'llm',
      confirmed: false,
      createdAt: now,
      updatedAt: now,
    })
  })

  describe('正常系', () => {
    it('ExtractedFieldの値を更新できる', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        extractedFieldId: efId,
        newValue: 'Updated Value',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.id.value).toBe(efId)
        expect(result.value.value).toBe('Updated Value')
        expect(result.value.source.value).toBe('manual')
      }
    })

    it('更新後にDBに反映されている', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        extractedFieldId: efId,
        newValue: 'Persisted Value',
      })

      expect(result.success).toBe(true)

      // DBから直接取得して確認
      const repo = new DrizzleApplicationRepository(db)
      const fieldsResult = await repo.findExtractedFieldsByApplicationId(
        (
          await import('../../../domain/valueObject/ApplicationId/ApplicationId')
        ).ApplicationId.fromString(appId)
      )
      expect(fieldsResult.success).toBe(true)
      if (fieldsResult.success) {
        const field = fieldsResult.value.find((f) => f.id.value === efId)
        expect(field).toBeDefined()
        expect(field!.value).toBe('Persisted Value')
        expect(field!.source.value).toBe('manual')
      }
    })
  })

  describe('異常系', () => {
    it('存在しないExtractedFieldIdの場合エラーを返す', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        extractedFieldId: 'non-existent-ef',
        newValue: 'test',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('not_found')
        expect(result.error.message).toContain('ExtractedField not found')
      }
    })

    it('存在しないApplicationIdの場合エラーを返す', async () => {
      const result = await usecase.execute({
        applicationId: 'non-existent-app',
        extractedFieldId: efId,
        newValue: 'test',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        // findExtractedFieldsByApplicationId は空リストを返すので not_found になる
        expect(result.error.type).toBe('not_found')
      }
    })
  })
})
