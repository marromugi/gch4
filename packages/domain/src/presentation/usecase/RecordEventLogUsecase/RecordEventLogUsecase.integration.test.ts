import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import {
  job,
  application as applicationTable,
  chatSession as chatSessionTable,
  reviewPolicyVersion as reviewPolicyVersionTable,
  jobSchemaVersion,
} from '@ding/database/schema'
import { DrizzleEventLogRepository } from '../../../infrastructure/repository/DrizzleEventLogRepository'
import { RecordEventLogUsecase } from './RecordEventLogUsecase'

describe('RecordEventLogUsecase', () => {
  let db: Database
  let usecase: RecordEventLogUsecase
  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const appId = 'test-app-1'
  const svId = 'test-sv-1'
  const csId = 'test-cs-1'
  const pvId = 'test-pv-1'

  beforeAll(() => {
    db = createTestDatabase()
    const eventLogRepository = new DrizzleEventLogRepository(db)
    usecase = new RecordEventLogUsecase({ eventLogRepository })
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    const now = new Date()
    // Seed job
    await db.insert(job).values({
      id: jobIdVal,
      title: 'Test Job',
      status: 'draft',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    // Seed schema version
    await db.insert(jobSchemaVersion).values({
      id: svId,
      jobId: jobIdVal,
      version: 1,
      status: 'draft',
      createdAt: now,
    })
    // Seed application
    await db.insert(applicationTable).values({
      id: appId,
      jobId: jobIdVal,
      schemaVersionId: svId,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    })
    // Seed chat session
    await db.insert(chatSessionTable).values({
      id: csId,
      applicationId: appId,
      type: 'application',
      status: 'active',
      bootstrapCompleted: false,
      turnCount: 0,
      reviewFailStreak: 0,
      extractionFailStreak: 0,
      timeoutStreak: 0,
      createdAt: now,
      updatedAt: now,
    })
    // Seed review policy version
    await db.insert(reviewPolicyVersionTable).values({
      id: pvId,
      jobId: jobIdVal,
      version: 1,
      status: 'draft',
      softCap: 6,
      hardCap: 10,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
  })

  describe('正常系', () => {
    it('最小限のフィールドでイベントログを記録できる', async () => {
      const result = await usecase.execute({
        eventLogId: 'evt-1',
        eventType: 'chat_started',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.id.value).toBe('evt-1')
        expect(result.value.eventType.value).toBe('chat_started')
        expect(result.value.applicationId).toBeNull()
        expect(result.value.jobId).toBeNull()
        expect(result.value.chatSessionId).toBeNull()
        expect(result.value.policyVersionId).toBeNull()
        expect(result.value.metadata).toBeNull()
      }
    })

    it('全てのオプショナルフィールドを指定してイベントログを記録できる', async () => {
      const result = await usecase.execute({
        eventLogId: 'evt-2',
        eventType: 'application_submitted',
        applicationId: appId,
        jobId: jobIdVal,
        chatSessionId: csId,
        policyVersionId: pvId,
        metadata: '{"key":"value"}',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.eventType.value).toBe('application_submitted')
        expect(result.value.applicationId?.value).toBe(appId)
        expect(result.value.jobId?.value).toBe(jobIdVal)
        expect(result.value.chatSessionId?.value).toBe(csId)
        expect(result.value.policyVersionId?.value).toBe(pvId)
        expect(result.value.metadata).toBe('{"key":"value"}')
      }
    })

    it('manual_fallback_triggered イベントを記録できる', async () => {
      const result = await usecase.execute({
        eventLogId: 'evt-3',
        eventType: 'manual_fallback_triggered',
        applicationId: appId,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.eventType.value).toBe('manual_fallback_triggered')
      }
    })
  })

  describe('異常系', () => {
    it('無効なeventTypeの場合バリデーションエラーを返す', async () => {
      const result = await usecase.execute({
        eventLogId: 'evt-err-1',
        eventType: 'invalid_event_type',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('Invalid eventType')
      }
    })
  })
})
