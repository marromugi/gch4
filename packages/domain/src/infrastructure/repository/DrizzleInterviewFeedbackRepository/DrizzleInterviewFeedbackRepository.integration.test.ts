import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import {
  job,
  jobSchemaVersion,
  application as applicationTable,
  chatSession as chatSessionTable,
  reviewPolicyVersion,
} from '@ding/database/schema'
import { DrizzleInterviewFeedbackRepository } from './DrizzleInterviewFeedbackRepository'
import { InterviewFeedback } from '../../../domain/entity/InterviewFeedback/InterviewFeedback'
import { InterviewFeedbackId } from '../../../domain/valueObject/InterviewFeedbackId/InterviewFeedbackId'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'

describe('DrizzleInterviewFeedbackRepository', () => {
  let db: Database
  let repo: DrizzleInterviewFeedbackRepository
  const userId = 'test-user-1'
  const jobId = 'test-job-1'
  const svId = 'test-sv-1'
  const appId = 'test-app-1'
  const sessionId = 'test-session-1'
  const policyId = 'test-policy-1'

  beforeAll(() => {
    db = createTestDatabase()
    repo = new DrizzleInterviewFeedbackRepository(db)
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    const now = new Date()
    await db.insert(job).values({
      id: jobId,
      title: 'Test Job',
      status: 'draft',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(jobSchemaVersion).values({
      id: svId,
      jobId,
      version: 1,
      status: 'draft',
      createdAt: now,
    })
    await db.insert(reviewPolicyVersion).values({
      id: policyId,
      jobId,
      version: 1,
      status: 'draft',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(applicationTable).values({
      id: appId,
      jobId,
      schemaVersionId: svId,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(chatSessionTable).values({
      id: sessionId,
      applicationId: appId,
      type: 'interview_feedback',
      policyVersionId: policyId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
  })

  const createFeedback = (id = 'fb-1') =>
    InterviewFeedback.reconstruct({
      id: InterviewFeedbackId.fromString(id),
      applicationId: ApplicationId.fromString(appId),
      chatSessionId: ChatSessionId.fromString(sessionId),
      policyVersionId: ReviewPolicyVersionId.fromString(policyId),
      structuredData: null,
      structuredSchemaVersion: 1,
      summaryConfirmedAt: null,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  describe('save / findById', () => {
    it('should save and retrieve feedback', async () => {
      const feedback = createFeedback()
      const saveResult = await repo.save(feedback)
      expect(saveResult.success).toBe(true)

      const findResult = await repo.findById(feedback.id)
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.id.value).toBe('fb-1')
        expect(findResult.value.structuredSchemaVersion).toBe(1)
      }
    })

    it('should upsert on save', async () => {
      const feedback = createFeedback()
      await repo.save(feedback)

      const updated = feedback.updateStructuredData('{"test":"data"}')
      await repo.save(updated)

      const findResult = await repo.findById(feedback.id)
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.structuredData).toBe('{"test":"data"}')
      }
    })

    it('should return error for non-existent feedback', async () => {
      const result = await repo.findById(InterviewFeedbackId.fromString('non-existent'))
      expect(result.success).toBe(false)
    })
  })

  describe('findByApplicationId', () => {
    it('should return feedbacks by application id', async () => {
      await repo.save(createFeedback('fb-1'))

      const result = await repo.findByApplicationId(ApplicationId.fromString(appId))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
      }
    })

    it('should return empty array when no feedbacks', async () => {
      const result = await repo.findByApplicationId(ApplicationId.fromString('non-existent'))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(0)
      }
    })
  })
})
