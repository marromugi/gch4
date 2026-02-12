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
import { SaveConsentLogUsecase } from './SaveConsentLogUsecase'

describe('SaveConsentLogUsecase', () => {
  let db: Database
  let usecase: SaveConsentLogUsecase
  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'
  const appId = 'test-app-1'

  beforeAll(() => {
    db = createTestDatabase()
    const applicationRepository = new DrizzleApplicationRepository(db)
    usecase = new SaveConsentLogUsecase({ applicationRepository })
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
    it('data_usage の同意ログを保存できる', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        consentLogId: 'consent-1',
        consentType: 'data_usage',
        consented: true,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.applicationId.value).toBe(appId)
        expect(result.value.consentType.value).toBe('data_usage')
        expect(result.value.consented).toBe(true)
        expect(result.value.ipAddress).toBe('127.0.0.1')
        expect(result.value.userAgent).toBe('test-agent')
      }
    })

    it('privacy_policy の同意ログを保存できる', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        consentLogId: 'consent-2',
        consentType: 'privacy_policy',
        consented: false,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.consentType.value).toBe('privacy_policy')
        expect(result.value.consented).toBe(false)
        expect(result.value.ipAddress).toBeNull()
        expect(result.value.userAgent).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('存在しないApplicationIdの場合エラーを返す', async () => {
      const result = await usecase.execute({
        applicationId: 'non-existent-app',
        consentLogId: 'consent-3',
        consentType: 'data_usage',
        consented: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('not found')
      }
    })

    it('無効なconsentTypeの場合バリデーションエラーを返す', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        consentLogId: 'consent-4',
        consentType: 'invalid_type',
        consented: true,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('Invalid consentType')
      }
    })
  })
})
