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
import { DrizzleInterviewFeedbackRepository } from '../../../infrastructure/repository/DrizzleInterviewFeedbackRepository'
import { SaveInterviewFeedbackUsecase } from './SaveInterviewFeedbackUsecase'
import type { SaveInterviewFeedbackInput } from './SaveInterviewFeedbackUsecase'

describe('SaveInterviewFeedbackUsecase', () => {
  let db: Database
  let usecase: SaveInterviewFeedbackUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const schemaVersionId = 'sv-1'
  const applicationId = 'app-1'
  const chatSessionId = 'cs-1'
  const policyVersionId = 'rpv-1'

  beforeAll(() => {
    db = createTestDatabase()
    const repo = new DrizzleInterviewFeedbackRepository(db)
    usecase = new SaveInterviewFeedbackUsecase({ interviewFeedbackRepository: repo })
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

    await db.insert(jobSchemaVersion).values({
      id: schemaVersionId,
      jobId: jobIdVal,
      version: 1,
      status: 'approved',
      createdAt: now,
    })

    await db.insert(reviewPolicyVersionTable).values({
      id: policyVersionId,
      jobId: jobIdVal,
      version: 1,
      status: 'published',
      softCap: 6,
      hardCap: 10,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    await db.insert(applicationTable).values({
      id: applicationId,
      jobId: jobIdVal,
      schemaVersionId: schemaVersionId,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    })

    await db.insert(chatSessionTable).values({
      id: chatSessionId,
      applicationId: applicationId,
      policyVersionId: policyVersionId,
      type: 'interview_feedback',
      status: 'active',
      turnCount: 0,
      bootstrapCompleted: false,
      reviewFailStreak: 0,
      extractionFailStreak: 0,
      timeoutStreak: 0,
      createdAt: now,
      updatedAt: now,
    })
  })

  describe('正常系', () => {
    it('フィードバックを保存できる', async () => {
      const input: SaveInterviewFeedbackInput = {
        id: 'fb-1',
        applicationId,
        chatSessionId,
        policyVersionId,
        structuredData: JSON.stringify({ signals: [] }),
        structuredSchemaVersion: 1,
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.id.value).toBe('fb-1')
        expect(result.value.applicationId.value).toBe(applicationId)
        expect(result.value.chatSessionId.value).toBe(chatSessionId)
        expect(result.value.policyVersionId.value).toBe(policyVersionId)
        expect(result.value.structuredData).toBe(JSON.stringify({ signals: [] }))
        expect(result.value.structuredSchemaVersion).toBe(1)
        expect(result.value.summaryConfirmedAt).toBeNull()
        expect(result.value.submittedAt).toBeNull()
      }
    })

    it('structuredDataがnullでも保存できる', async () => {
      const input: SaveInterviewFeedbackInput = {
        id: 'fb-2',
        applicationId,
        chatSessionId,
        policyVersionId,
        structuredData: null,
        structuredSchemaVersion: 1,
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.structuredData).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('idが空の場合バリデーションエラーになる', async () => {
      const input: SaveInterviewFeedbackInput = {
        id: '',
        applicationId,
        chatSessionId,
        policyVersionId,
        structuredData: null,
        structuredSchemaVersion: 1,
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('id is required')
      }
    })

    it('applicationIdが空の場合バリデーションエラーになる', async () => {
      const input: SaveInterviewFeedbackInput = {
        id: 'fb-3',
        applicationId: '',
        chatSessionId,
        policyVersionId,
        structuredData: null,
        structuredSchemaVersion: 1,
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('applicationId is required')
      }
    })

    it('chatSessionIdが空の場合バリデーションエラーになる', async () => {
      const input: SaveInterviewFeedbackInput = {
        id: 'fb-4',
        applicationId,
        chatSessionId: '',
        policyVersionId,
        structuredData: null,
        structuredSchemaVersion: 1,
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('chatSessionId is required')
      }
    })

    it('policyVersionIdが空の場合バリデーションエラーになる', async () => {
      const input: SaveInterviewFeedbackInput = {
        id: 'fb-5',
        applicationId,
        chatSessionId,
        policyVersionId: '',
        structuredData: null,
        structuredSchemaVersion: 1,
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('policyVersionId is required')
      }
    })

    it('複数のバリデーションエラーが同時に返る', async () => {
      const input: SaveInterviewFeedbackInput = {
        id: '',
        applicationId: '',
        chatSessionId: '',
        policyVersionId: '',
        structuredData: null,
        structuredSchemaVersion: 1,
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('id is required')
        expect(result.error.message).toContain('applicationId is required')
        expect(result.error.message).toContain('chatSessionId is required')
        expect(result.error.message).toContain('policyVersionId is required')
      }
    })
  })
})
