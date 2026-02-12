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
import { SaveInterviewFeedbackUsecase } from '../SaveInterviewFeedbackUsecase/SaveInterviewFeedbackUsecase'
import { GetInterviewFeedbackUsecase } from './GetInterviewFeedbackUsecase'

describe('GetInterviewFeedbackUsecase', () => {
  let db: Database
  let saveUsecase: SaveInterviewFeedbackUsecase
  let getUsecase: GetInterviewFeedbackUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const schemaVersionId = 'sv-1'
  const applicationId = 'app-1'
  const chatSessionId = 'cs-1'
  const policyVersionId = 'rpv-1'

  beforeAll(() => {
    db = createTestDatabase()
    const repo = new DrizzleInterviewFeedbackRepository(db)
    saveUsecase = new SaveInterviewFeedbackUsecase({ interviewFeedbackRepository: repo })
    getUsecase = new GetInterviewFeedbackUsecase({ interviewFeedbackRepository: repo })
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
    it('applicationIdでフィードバックを取得できる', async () => {
      const saveResult = await saveUsecase.execute({
        id: 'fb-1',
        applicationId,
        chatSessionId,
        policyVersionId,
        structuredData: JSON.stringify({ signals: ['good'] }),
        structuredSchemaVersion: 1,
      })
      expect(saveResult.success).toBe(true)

      const result = await getUsecase.execute({ applicationId })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).not.toBeNull()
        expect(result.value).toHaveLength(1)
        expect(result.value![0].id.value).toBe('fb-1')
        expect(result.value![0].applicationId.value).toBe(applicationId)
      }
    })

    it('複数のフィードバックを取得できる', async () => {
      // 2つ目のChatSessionを作成
      const now = new Date()
      await db.insert(chatSessionTable).values({
        id: 'cs-2',
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

      await saveUsecase.execute({
        id: 'fb-1',
        applicationId,
        chatSessionId,
        policyVersionId,
        structuredData: null,
        structuredSchemaVersion: 1,
      })
      await saveUsecase.execute({
        id: 'fb-2',
        applicationId,
        chatSessionId: 'cs-2',
        policyVersionId,
        structuredData: null,
        structuredSchemaVersion: 1,
      })

      const result = await getUsecase.execute({ applicationId })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).not.toBeNull()
        expect(result.value).toHaveLength(2)
      }
    })

    it('フィードバックが存在しない場合nullを返す', async () => {
      const result = await getUsecase.execute({ applicationId })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('applicationIdが空の場合バリデーションエラーになる', async () => {
      const result = await getUsecase.execute({ applicationId: '' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('applicationId is required')
      }
    })
  })
})
