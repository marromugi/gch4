import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { ListJobsUsecase } from './ListJobsUsecase'
import { ListJobsValidationError, ListJobsRepositoryError } from './ListJobsUsecase'
import type { ListJobsDeps } from './ListJobsUsecase'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'

const mockJobs = [
  Job.reconstruct({
    id: JobId.fromString('job-1'),
    title: 'Senior Engineer',
    description: null,
    idealCandidate: null,
    cultureContext: null,
    status: JobStatus.draft(),
    createdBy: UserId.fromString('user-1'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  }),
  Job.reconstruct({
    id: JobId.fromString('job-2'),
    title: 'Product Manager',
    description: null,
    idealCandidate: null,
    cultureContext: null,
    status: JobStatus.open(),
    createdBy: UserId.fromString('user-1'),
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  }),
]

const createMockDeps = (overrides?: Partial<IJobRepository>): ListJobsDeps => ({
  jobRepository: {
    findByCreatedBy: vi.fn().mockResolvedValue(Result.ok(mockJobs)),
    findById: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    findFormFieldsByJobId: vi.fn(),
    saveFormField: vi.fn(),
    saveFormFields: vi.fn(),
    findSchemaVersionsByJobId: vi.fn(),
    findLatestSchemaVersion: vi.fn(),
    saveSchemaVersion: vi.fn(),
    findFactDefinitionsBySchemaVersionId: vi.fn(),
    saveFactDefinitions: vi.fn(),
    findProhibitedTopicsBySchemaVersionId: vi.fn(),
    saveProhibitedTopics: vi.fn(),
    ...overrides,
  } as unknown as IJobRepository,
})

describe('ListJobsUsecase', () => {
  describe('正常系', () => {
    it('ユーザーIDで求人一覧を取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new ListJobsUsecase(deps)

      const result = await usecase.execute({ userId: 'user-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(2)
        expect(result.value[0].title).toBe('Senior Engineer')
        expect(result.value[1].title).toBe('Product Manager')
      }
    })

    it('求人が0件の場合も正常に空配列を返す', async () => {
      const deps = createMockDeps({
        findByCreatedBy: vi.fn().mockResolvedValue(Result.ok([])),
      })
      const usecase = new ListJobsUsecase(deps)

      const result = await usecase.execute({ userId: 'user-2' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('userIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new ListJobsUsecase(deps)

      const result = await usecase.execute({ userId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(ListJobsValidationError)
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('リポジトリがエラーを返した場合リポジトリエラー', async () => {
      const deps = createMockDeps({
        findByCreatedBy: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new ListJobsUsecase(deps)

      const result = await usecase.execute({ userId: 'user-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(ListJobsRepositoryError)
        expect(result.error.type).toBe('repository_error')
      }
    })
  })
})
