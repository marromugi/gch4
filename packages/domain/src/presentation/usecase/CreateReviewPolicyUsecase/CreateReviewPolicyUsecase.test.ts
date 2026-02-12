import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { CreateReviewPolicyUsecase } from './CreateReviewPolicyUsecase'
import type { CreateReviewPolicyDeps, CreateReviewPolicyInput } from './CreateReviewPolicyUsecase'
import type { IReviewPolicyRepository } from '../../../domain/repository/IReviewPolicyRepository/IReviewPolicyRepository'

const createMockDeps = (overrides?: Partial<IReviewPolicyRepository>): CreateReviewPolicyDeps => ({
  reviewPolicyRepository: {
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
    saveSignals: vi.fn().mockResolvedValue(Result.ok(undefined)),
    saveProhibitedTopics: vi.fn().mockResolvedValue(Result.ok(undefined)),
    findById: vi.fn(),
    findByJobId: vi.fn(),
    findLatestPublishedByJobId: vi.fn(),
    findSignalsByPolicyVersionId: vi.fn(),
    findProhibitedTopicsByPolicyVersionId: vi.fn(),
    ...overrides,
  } as unknown as IReviewPolicyRepository,
})

const validInput: CreateReviewPolicyInput = {
  id: 'policy-1',
  jobId: 'job-1',
  createdBy: 'user-1',
  softCap: 3,
  hardCap: 5,
  signals: [
    {
      label: 'Technical Skills',
      description: 'Evaluate technical ability',
      priority: 'high',
      category: 'must',
    },
    { label: 'Culture Fit', description: null, priority: 'supporting', category: 'nice' },
  ],
  prohibitedTopics: [{ topic: 'Personal health information' }],
}

describe('CreateReviewPolicyUsecase', () => {
  describe('正常系', () => {
    it('レビュー方針を作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.policy.jobId.value).toBe('job-1')
        expect(result.value.policy.status.isDraft()).toBe(true)
        expect(result.value.policy.version).toBe(1)
        expect(result.value.signals).toHaveLength(2)
        expect(result.value.prohibitedTopics).toHaveLength(1)
      }
    })

    it('禁止トピックなしでも作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute({
        ...validInput,
        prohibitedTopics: [],
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.prohibitedTopics).toHaveLength(0)
      }
    })

    it('リポジトリのsave, saveSignals, saveProhibitedTopicsが呼ばれる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateReviewPolicyUsecase(deps)

      await usecase.execute(validInput)

      expect(deps.reviewPolicyRepository.save).toHaveBeenCalledTimes(1)
      expect(deps.reviewPolicyRepository.saveSignals).toHaveBeenCalledTimes(1)
      expect(deps.reviewPolicyRepository.saveProhibitedTopics).toHaveBeenCalledTimes(1)
    })
  })

  describe('異常系', () => {
    it('idが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute({ ...validInput, id: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('jobIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute({ ...validInput, jobId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('signalsが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute({ ...validInput, signals: [] })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('signalのlabelが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute({
        ...validInput,
        signals: [{ label: '', description: null, priority: 'high', category: 'must' }],
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('リポジトリのsaveが失敗した場合save_error', async () => {
      const deps = createMockDeps({
        save: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('save_error')
      }
    })

    it('リポジトリのsaveSignalsが失敗した場合save_error', async () => {
      const deps = createMockDeps({
        saveSignals: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new CreateReviewPolicyUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('save_error')
      }
    })
  })
})
