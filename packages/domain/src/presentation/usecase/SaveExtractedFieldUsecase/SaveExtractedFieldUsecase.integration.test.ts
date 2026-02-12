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
} from '@ding/database/schema'
import { DrizzleApplicationRepository } from '../../../infrastructure/repository/DrizzleApplicationRepository'
import { SaveExtractedFieldUsecase } from './SaveExtractedFieldUsecase'

describe('SaveExtractedFieldUsecase', () => {
  let db: Database
  let usecase: SaveExtractedFieldUsecase
  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'
  const appId = 'test-app-1'

  beforeAll(() => {
    db = createTestDatabase()
    const applicationRepository = new DrizzleApplicationRepository(db)
    usecase = new SaveExtractedFieldUsecase({ applicationRepository })
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
  })

  describe('正常系', () => {
    it('llmソースでExtractedFieldを保存できる', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        extractedFieldId: 'ef-1',
        jobFormFieldId: fieldId,
        value: 'John Doe',
        source: 'llm',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.id.value).toBe('ef-1')
        expect(result.value.applicationId.value).toBe(appId)
        expect(result.value.jobFormFieldId.value).toBe(fieldId)
        expect(result.value.value).toBe('John Doe')
        expect(result.value.source.value).toBe('llm')
        expect(result.value.confirmed).toBe(false)
      }
    })

    it('manualソースでExtractedFieldを保存できる', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        extractedFieldId: 'ef-2',
        jobFormFieldId: fieldId,
        value: 'Jane Doe',
        source: 'manual',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.source.value).toBe('manual')
      }
    })
  })

  describe('異常系', () => {
    it('存在しないApplicationIdの場合エラーを返す', async () => {
      const result = await usecase.execute({
        applicationId: 'non-existent-app',
        extractedFieldId: 'ef-3',
        jobFormFieldId: fieldId,
        value: 'test',
        source: 'llm',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('not found')
      }
    })

    it('無効なsourceの場合バリデーションエラーを返す', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        extractedFieldId: 'ef-4',
        jobFormFieldId: fieldId,
        value: 'test',
        source: 'invalid_source',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('Invalid source')
      }
    })
  })
})
