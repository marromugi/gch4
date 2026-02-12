import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { Job } from '../../../domain/entity/Job/Job'
import { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import { JobSchemaVersionStatus } from '../../../domain/valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import {
  CreateApplicationUsecase,
  CreateApplicationNoSchemaVersionError,
  CreateApplicationRepositoryError,
  type CreateApplicationDeps,
} from './CreateApplicationUsecase'

const createMockDeps = (): CreateApplicationDeps => ({
  applicationRepository: {
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
  } as unknown as IApplicationRepository,
  jobRepository: {
    findById: vi.fn().mockResolvedValue(
      Result.ok(
        Job.reconstruct({
          id: JobId.fromString('job-1'),
          title: 'Test Job',
          description: null,
          idealCandidate: null,
          cultureContext: null,
          status: JobStatus.open(),
          createdBy: UserId.fromString('user-1'),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
    ),
    findLatestSchemaVersion: vi.fn().mockResolvedValue(
      Result.ok(
        JobSchemaVersion.reconstruct({
          id: JobSchemaVersionId.fromString('sv-1'),
          jobId: JobId.fromString('job-1'),
          version: 1,
          status: JobSchemaVersionStatus.approved(),
          approvedAt: new Date(),
          createdAt: new Date(),
        })
      )
    ),
  } as unknown as IJobRepository,
})

describe('CreateApplicationUsecase', () => {
  describe('正常系', () => {
    it('応募を作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateApplicationUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        jobId: 'job-1',
        schemaVersionId: 'sv-1',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.id.value).toBe('app-1')
        expect(result.value.jobId.value).toBe('job-1')
        expect(result.value.status.isNew()).toBe(true)
      }
      expect(deps.applicationRepository.save).toHaveBeenCalled()
    })
  })

  describe('異常系', () => {
    it('Jobの取得に失敗した場合エラーを返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.jobRepository.findById).mockResolvedValue(
        Result.err(new Error('Job not found'))
      )
      const usecase = new CreateApplicationUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        jobId: 'job-1',
        schemaVersionId: 'sv-1',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateApplicationRepositoryError)
      }
    })

    it('スキーマバージョンが存在しない場合エラーを返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.jobRepository.findLatestSchemaVersion).mockResolvedValue(Result.ok(null))
      const usecase = new CreateApplicationUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        jobId: 'job-1',
        schemaVersionId: 'sv-1',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateApplicationNoSchemaVersionError)
      }
    })

    it('保存に失敗した場合エラーを返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.applicationRepository.save).mockResolvedValue(
        Result.err(new Error('Save failed'))
      )
      const usecase = new CreateApplicationUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        jobId: 'job-1',
        schemaVersionId: 'sv-1',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateApplicationRepositoryError)
      }
    })
  })
})
