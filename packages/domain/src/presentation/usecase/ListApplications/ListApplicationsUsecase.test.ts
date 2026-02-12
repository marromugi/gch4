import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import {
  ListApplicationsUsecase,
  ListApplicationsRepositoryError,
  type ListApplicationsDeps,
} from './ListApplicationsUsecase'

const createMockApplication = (id: string): Application => {
  const now = new Date()
  return Application.reconstruct({
    id: ApplicationId.fromString(id),
    jobId: JobId.fromString('job-1'),
    schemaVersionId: JobSchemaVersionId.fromString('sv-1'),
    applicantName: null,
    applicantEmail: null,
    language: null,
    country: null,
    timezone: null,
    status: ApplicationStatus.new(),
    meetLink: null,
    extractionReviewedAt: null,
    consentCheckedAt: null,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

const createMockDeps = (): ListApplicationsDeps => ({
  applicationRepository: {
    findByJobId: vi
      .fn()
      .mockResolvedValue(
        Result.ok([createMockApplication('app-1'), createMockApplication('app-2')])
      ),
  } as unknown as IApplicationRepository,
})

describe('ListApplicationsUsecase', () => {
  describe('正常系', () => {
    it('応募一覧を取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new ListApplicationsUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(2)
        expect(result.value[0].id.value).toBe('app-1')
        expect(result.value[1].id.value).toBe('app-2')
      }
    })

    it('応募が存在しない場合は空配列を返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.applicationRepository.findByJobId).mockResolvedValue(Result.ok([]))
      const usecase = new ListApplicationsUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('リポジトリエラーの場合エラーを返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.applicationRepository.findByJobId).mockResolvedValue(
        Result.err(new Error('DB error'))
      )
      const usecase = new ListApplicationsUsecase(deps)

      const result = await usecase.execute({ jobId: 'job-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(ListApplicationsRepositoryError)
      }
    })
  })
})
