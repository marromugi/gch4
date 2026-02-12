import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import {
  GetApplicationUsecase,
  GetApplicationRepositoryError,
  type GetApplicationDeps,
} from './GetApplicationUsecase'

const createMockApplication = (): Application => {
  const now = new Date()
  return Application.reconstruct({
    id: ApplicationId.fromString('app-1'),
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

const createMockDeps = (): GetApplicationDeps => ({
  applicationRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockApplication())),
  } as unknown as IApplicationRepository,
})

describe('GetApplicationUsecase', () => {
  describe('正常系', () => {
    it('応募を取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new GetApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.id.value).toBe('app-1')
      }
    })
  })

  describe('異常系', () => {
    it('リポジトリエラーの場合エラーを返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.applicationRepository.findById).mockResolvedValue(
        Result.err(new Error('Not found'))
      )
      const usecase = new GetApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetApplicationRepositoryError)
      }
    })
  })
})
