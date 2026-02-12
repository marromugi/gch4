import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { PublishReviewPolicyUsecase } from './PublishReviewPolicyUsecase'
import type { PublishReviewPolicyDeps } from './PublishReviewPolicyUsecase'
import {
  PublishReviewPolicyNotFoundError,
  PublishReviewPolicyStatusError,
} from './PublishReviewPolicyUsecase'
import { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { ReviewPolicyVersionStatus } from '../../../domain/valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IReviewPolicyRepository } from '../../../domain/repository/IReviewPolicyRepository/IReviewPolicyRepository'

const now = new Date()

const createConfirmedPolicy = () =>
  ReviewPolicyVersion.reconstruct({
    id: ReviewPolicyVersionId.fromString('policy-1'),
    jobId: JobId.fromString('job-1'),
    version: 1,
    status: ReviewPolicyVersionStatus.confirmed(),
    softCap: 3,
    hardCap: 5,
    createdBy: UserId.fromString('user-1'),
    confirmedAt: now,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  })

const createDraftPolicy = () =>
  ReviewPolicyVersion.reconstruct({
    id: ReviewPolicyVersionId.fromString('policy-1'),
    jobId: JobId.fromString('job-1'),
    version: 1,
    status: ReviewPolicyVersionStatus.draft(),
    softCap: 3,
    hardCap: 5,
    createdBy: UserId.fromString('user-1'),
    confirmedAt: null,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  })

const createMockDeps = (overrides?: Partial<IReviewPolicyRepository>): PublishReviewPolicyDeps => ({
  reviewPolicyRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createConfirmedPolicy())),
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
    findByJobId: vi.fn(),
    findLatestPublishedByJobId: vi.fn(),
    findSignalsByPolicyVersionId: vi.fn(),
    findProhibitedTopicsByPolicyVersionId: vi.fn(),
    saveSignals: vi.fn(),
    saveProhibitedTopics: vi.fn(),
    ...overrides,
  } as unknown as IReviewPolicyRepository,
})

describe('PublishReviewPolicyUsecase', () => {
  describe('正常系', () => {
    it('confirmed状態のレビュー方針を公開できる', async () => {
      const deps = createMockDeps()
      const usecase = new PublishReviewPolicyUsecase(deps)

      const result = await usecase.execute({ reviewPolicyVersionId: 'policy-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isPublished()).toBe(true)
        expect(result.value.publishedAt).not.toBeNull()
      }
    })

    it('リポジトリのsaveが呼ばれる', async () => {
      const deps = createMockDeps()
      const usecase = new PublishReviewPolicyUsecase(deps)

      await usecase.execute({ reviewPolicyVersionId: 'policy-1' })

      expect(deps.reviewPolicyRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('異常系', () => {
    it('reviewPolicyVersionIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new PublishReviewPolicyUsecase(deps)

      const result = await usecase.execute({ reviewPolicyVersionId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('レビュー方針が見つからない場合not_found_error', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
      })
      const usecase = new PublishReviewPolicyUsecase(deps)

      const result = await usecase.execute({ reviewPolicyVersionId: 'nonexistent' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(PublishReviewPolicyNotFoundError)
        expect(result.error.type).toBe('not_found_error')
      }
    })

    it('draft状態の場合status_error', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(createDraftPolicy())),
      })
      const usecase = new PublishReviewPolicyUsecase(deps)

      const result = await usecase.execute({ reviewPolicyVersionId: 'policy-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(PublishReviewPolicyStatusError)
        expect(result.error.type).toBe('status_error')
      }
    })

    it('リポジトリのsaveが失敗した場合save_error', async () => {
      const deps = createMockDeps({
        save: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new PublishReviewPolicyUsecase(deps)

      const result = await usecase.execute({ reviewPolicyVersionId: 'policy-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('save_error')
      }
    })
  })
})
