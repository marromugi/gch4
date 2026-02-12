import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { UpdateJobUsecase } from './UpdateJobUsecase'
import { UpdateJobValidationError, UpdateJobRepositoryError } from './UpdateJobUsecase'
import type { UpdateJobDeps } from './UpdateJobUsecase'
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

const createMockDeps = (overrides?: Partial<IJobRepository>): UpdateJobDeps => ({
  jobRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(mockJob)),
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
    findByCreatedBy: vi.fn(),
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

describe('UpdateJobUsecase', () => {
  describe('正常系', () => {
    it('タイトルを更新できる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1', title: 'Lead Engineer' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.title).toBe('Lead Engineer')
        expect(result.value.idealCandidate).toBe('Experienced')
        expect(result.value.cultureContext).toBe('Remote-first')
      }
    })

    it('idealCandidateを更新できる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({
        jobId: 'job-1',
        idealCandidate: 'New ideal candidate',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.idealCandidate).toBe('New ideal candidate')
        expect(result.value.title).toBe('Senior Engineer')
      }
    })

    it('cultureContextを更新できる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({
        jobId: 'job-1',
        cultureContext: 'Office-first',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.cultureContext).toBe('Office-first')
      }
    })

    it('idealCandidateをnullに設定できる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({
        jobId: 'job-1',
        idealCandidate: null,
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.idealCandidate).toBeNull()
      }
    })

    it('updatedAtが更新される', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1', title: 'Updated' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.updatedAt.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime())
      }
    })

    it('リポジトリのsaveが呼ばれる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      await usecase.execute({ jobId: 'job-1', title: 'Updated' })

      expect(deps.jobRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('異常系', () => {
    it('jobIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({ jobId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateJobValidationError)
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('titleが空文字の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1', title: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateJobValidationError)
      }
    })

    it('求人が存在しない場合NotFoundエラー', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('not found'))),
      })
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({ jobId: 'non-existent', title: 'Updated' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateJobRepositoryError)
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('保存が失敗した場合リポジトリエラー', async () => {
      const deps = createMockDeps({
        save: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new UpdateJobUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1', title: 'Updated' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateJobRepositoryError)
        expect(result.error.type).toBe('repository_error')
      }
    })
  })
})
