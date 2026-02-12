import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { GetReviewPolicyUsecase } from './GetReviewPolicyUsecase'
import type { GetReviewPolicyDeps } from './GetReviewPolicyUsecase'
import { ReviewPolicyVersion } from '../../../domain/entity/ReviewPolicyVersion/ReviewPolicyVersion'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { ReviewPolicyVersionStatus } from '../../../domain/valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IReviewPolicyRepository } from '../../../domain/repository/IReviewPolicyRepository/IReviewPolicyRepository'

const now = new Date()

const createPolicy = (version: number) =>
  ReviewPolicyVersion.reconstruct({
    id: ReviewPolicyVersionId.fromString(`policy-v${version}`),
    jobId: JobId.fromString('job-1'),
    version,
    status: ReviewPolicyVersionStatus.draft(),
    softCap: 3,
    hardCap: 5,
    createdBy: UserId.fromString('user-1'),
    confirmedAt: null,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  })

const createMockDeps = (overrides?: Partial<IReviewPolicyRepository>): GetReviewPolicyDeps => ({
  reviewPolicyRepository: {
    findByJobId: vi.fn().mockResolvedValue(Result.ok([createPolicy(1), createPolicy(2)])),
    findSignalsByPolicyVersionId: vi.fn().mockResolvedValue(Result.ok([])),
    findProhibitedTopicsByPolicyVersionId: vi.fn().mockResolvedValue(Result.ok([])),
    findById: vi.fn(),
    findLatestPublishedByJobId: vi.fn(),
    save: vi.fn(),
    saveSignals: vi.fn(),
    saveProhibitedTopics: vi.fn(),
    ...overrides,
  } as unknown as IReviewPolicyRepository,
})

describe('GetReviewPolicyUsecase', () => {
  describe('正常系', () => {
    it('最新バージョンのレビュー方針を取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new GetReviewPolicyUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result) && result.value !== null) {
        expect(result.value.policy.version).toBe(2)
        expect(result.value.policy.id.value).toBe('policy-v2')
      }
    })

    it('レビュー方針が存在しない場合nullを返す', async () => {
      const deps = createMockDeps({
        findByJobId: vi.fn().mockResolvedValue(Result.ok([])),
      })
      const usecase = new GetReviewPolicyUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-nonexistent' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('jobIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new GetReviewPolicyUsecase(deps)

      const result = await usecase.execute({ jobId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('リポジトリのfindByJobIdが失敗した場合fetch_error', async () => {
      const deps = createMockDeps({
        findByJobId: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new GetReviewPolicyUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('fetch_error')
      }
    })

    it('リポジトリのfindSignalsByPolicyVersionIdが失敗した場合fetch_error', async () => {
      const deps = createMockDeps({
        findSignalsByPolicyVersionId: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new GetReviewPolicyUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('fetch_error')
      }
    })
  })
})
