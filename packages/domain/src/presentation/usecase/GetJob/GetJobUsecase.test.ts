import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { GetJobUsecase } from './GetJobUsecase'
import { GetJobValidationError, GetJobRepositoryError } from './GetJobUsecase'
import type { GetJobDeps } from './GetJobUsecase'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'

const mockJob = Job.reconstruct({
  id: JobId.fromString('job-1'),
  title: 'Senior Engineer',
  description: null,
  idealCandidate: 'Experienced',
  cultureContext: 'Remote-first',
  status: JobStatus.draft(),
  createdBy: UserId.fromString('user-1'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
})

const createMockDeps = (overrides?: Partial<IJobRepository>): GetJobDeps => ({
  jobRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(mockJob)),
    findByCreatedBy: vi.fn(),
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

describe('GetJobUsecase', () => {
  describe('正常系', () => {
    it('IDで求人を取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new GetJobUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.title).toBe('Senior Engineer')
        expect(result.value.id.value).toBe('job-1')
      }
    })

    it('リポジトリのfindByIdが正しいIDで呼ばれる', async () => {
      const deps = createMockDeps()
      const usecase = new GetJobUsecase(deps)

      await usecase.execute({ jobId: 'job-1' })

      expect(deps.jobRepository.findById).toHaveBeenCalledTimes(1)
    })
  })

  describe('異常系', () => {
    it('jobIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new GetJobUsecase(deps)

      const result = await usecase.execute({ jobId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetJobValidationError)
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('リポジトリがエラーを返した場合リポジトリエラー', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new GetJobUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetJobRepositoryError)
        expect(result.error.type).toBe('repository_error')
      }
    })
  })
})
