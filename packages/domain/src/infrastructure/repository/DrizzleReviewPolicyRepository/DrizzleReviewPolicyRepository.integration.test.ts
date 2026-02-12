import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { job } from '@ding/database/schema'
import { DrizzleReviewPolicyRepository } from './DrizzleReviewPolicyRepository'
import { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import { ReviewPolicySignal } from '../../../domain/entity/ReviewPolicySignal/ReviewPolicySignal'
import { ReviewProhibitedTopic } from '../../../domain/entity/ReviewProhibitedTopic/ReviewProhibitedTopic'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { ReviewPolicyVersionStatus } from '../../../domain/valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'
import { ReviewPolicySignalId } from '../../../domain/valueObject/ReviewPolicySignalId/ReviewPolicySignalId'
import { ReviewSignalPriority } from '../../../domain/valueObject/ReviewSignalPriority/ReviewSignalPriority'
import { ReviewSignalCategory } from '../../../domain/valueObject/ReviewSignalCategory/ReviewSignalCategory'

describe('DrizzleReviewPolicyRepository', () => {
  let db: Database
  let repo: DrizzleReviewPolicyRepository
  const userId = 'test-user-1'
  const jobId = 'test-job-1'

  beforeAll(() => {
    db = createTestDatabase()
    repo = new DrizzleReviewPolicyRepository(db)
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    await db.insert(job).values({
      id: jobId,
      title: 'Test Job',
      status: 'draft',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  const createPolicy = (id = 'rpv-1', version = 1, status = ReviewPolicyVersionStatus.draft()) =>
    ReviewPolicyVersion.reconstruct({
      id: ReviewPolicyVersionId.fromString(id),
      jobId: JobId.fromString(jobId),
      version,
      status,
      softCap: 6,
      hardCap: 10,
      createdBy: UserId.fromString(userId),
      confirmedAt: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  describe('save / findById', () => {
    it('should save and retrieve a policy version', async () => {
      const policy = createPolicy()
      const saveResult = await repo.save(policy)
      expect(saveResult.success).toBe(true)

      const findResult = await repo.findById(policy.id)
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.id.value).toBe('rpv-1')
        expect(findResult.value.version).toBe(1)
        expect(findResult.value.softCap).toBe(6)
        expect(findResult.value.hardCap).toBe(10)
      }
    })

    it('should return error for non-existent policy', async () => {
      const result = await repo.findById(ReviewPolicyVersionId.fromString('non-existent'))
      expect(result.success).toBe(false)
    })
  })

  describe('findByJobId', () => {
    it('should return policy versions by job id', async () => {
      await repo.save(createPolicy('rpv-1', 1))
      await repo.save(createPolicy('rpv-2', 2))

      const result = await repo.findByJobId(JobId.fromString(jobId))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(2)
      }
    })
  })

  describe('findLatestPublishedByJobId', () => {
    it('should return the latest published version', async () => {
      await repo.save(createPolicy('rpv-1', 1, ReviewPolicyVersionStatus.published()))
      await repo.save(createPolicy('rpv-2', 2, ReviewPolicyVersionStatus.published()))
      await repo.save(createPolicy('rpv-3', 3, ReviewPolicyVersionStatus.draft()))

      const result = await repo.findLatestPublishedByJobId(JobId.fromString(jobId))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).not.toBeNull()
        expect(result.value!.version).toBe(2)
      }
    })

    it('should return null when no published versions', async () => {
      await repo.save(createPolicy('rpv-1', 1, ReviewPolicyVersionStatus.draft()))

      const result = await repo.findLatestPublishedByJobId(JobId.fromString(jobId))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeNull()
      }
    })
  })

  describe('ReviewPolicySignal', () => {
    it('should save and find signals', async () => {
      const policy = createPolicy()
      await repo.save(policy)

      const signals = [
        ReviewPolicySignal.reconstruct({
          id: ReviewPolicySignalId.fromString('rps-1'),
          policyVersionId: policy.id,
          signalKey: 'communication',
          label: 'Communication Skills',
          description: 'Evaluates communication',
          priority: ReviewSignalPriority.high(),
          category: ReviewSignalCategory.must(),
          sortOrder: 0,
          createdAt: new Date(),
        }),
        ReviewPolicySignal.reconstruct({
          id: ReviewPolicySignalId.fromString('rps-2'),
          policyVersionId: policy.id,
          signalKey: 'technical',
          label: 'Technical Skills',
          description: null,
          priority: ReviewSignalPriority.supporting(),
          category: ReviewSignalCategory.nice(),
          sortOrder: 1,
          createdAt: new Date(),
        }),
      ]
      await repo.saveSignals(signals)

      const result = await repo.findSignalsByPolicyVersionId(policy.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(2)
        expect(result.value[0].priority.value).toBe('high')
      }
    })
  })

  describe('ReviewProhibitedTopic', () => {
    it('should save and find prohibited topics', async () => {
      const policy = createPolicy()
      await repo.save(policy)

      const topics = [
        ReviewProhibitedTopic.reconstruct({
          id: 'rpt-1',
          policyVersionId: policy.id,
          topic: 'Salary negotiation',
          createdAt: new Date(),
        }),
      ]
      await repo.saveProhibitedTopics(topics)

      const result = await repo.findProhibitedTopicsByPolicyVersionId(policy.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].topic).toBe('Salary negotiation')
      }
    })
  })
})
