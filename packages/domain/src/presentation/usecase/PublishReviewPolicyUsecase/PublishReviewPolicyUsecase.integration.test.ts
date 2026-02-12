import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { job } from '@ding/database/schema'
import { DrizzleReviewPolicyRepository } from '../../../infrastructure/repository/DrizzleReviewPolicyRepository'
import { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { ReviewPolicyVersionStatus } from '../../../domain/valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { PublishReviewPolicyUsecase } from './PublishReviewPolicyUsecase'

describe('PublishReviewPolicyUsecase', () => {
  let db: Database
  let repo: DrizzleReviewPolicyRepository
  let usecase: PublishReviewPolicyUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'

  beforeAll(() => {
    db = createTestDatabase()
    repo = new DrizzleReviewPolicyRepository(db)
    usecase = new PublishReviewPolicyUsecase({ reviewPolicyRepository: repo })
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
  })

  const createAndSavePolicy = async (id: string, status: ReviewPolicyVersionStatus) => {
    const policy = ReviewPolicyVersion.reconstruct({
      id: ReviewPolicyVersionId.fromString(id),
      jobId: JobId.fromString(jobIdVal),
      version: 1,
      status,
      softCap: 6,
      hardCap: 10,
      createdBy: UserId.fromString(userId),
      confirmedAt: status.isConfirmed() ? new Date() : null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const saveResult = await repo.save(policy)
    expect(saveResult.success).toBe(true)
    return policy
  }

  describe('正常系', () => {
    it('confirmed状態のレビュー方針をpublishできる', async () => {
      await createAndSavePolicy('rpv-1', ReviewPolicyVersionStatus.confirmed())

      const result = await usecase.execute({ reviewPolicyVersionId: 'rpv-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.status.isPublished()).toBe(true)
        expect(result.value.publishedAt).not.toBeNull()
      }
    })

    it('publish後にDBからも更新が反映されている', async () => {
      await createAndSavePolicy('rpv-2', ReviewPolicyVersionStatus.confirmed())

      const publishResult = await usecase.execute({ reviewPolicyVersionId: 'rpv-2' })
      expect(publishResult.success).toBe(true)

      const findResult = await repo.findById(ReviewPolicyVersionId.fromString('rpv-2'))
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.status.isPublished()).toBe(true)
        expect(findResult.value.publishedAt).not.toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('reviewPolicyVersionIdが空の場合バリデーションエラーになる', async () => {
      const result = await usecase.execute({ reviewPolicyVersionId: '' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('reviewPolicyVersionId is required')
      }
    })

    it('存在しないIDの場合not_found_errorになる', async () => {
      const result = await usecase.execute({ reviewPolicyVersionId: 'non-existent' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('not_found_error')
      }
    })

    it('draft状態のレビュー方針はpublishできない', async () => {
      await createAndSavePolicy('rpv-3', ReviewPolicyVersionStatus.draft())

      const result = await usecase.execute({ reviewPolicyVersionId: 'rpv-3' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('status_error')
        expect(result.error.message).toContain('draft')
      }
    })
  })
})
