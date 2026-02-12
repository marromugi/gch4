import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { SaveConsentLogUsecase } from './SaveConsentLogUsecase'
import {
  SaveConsentLogValidationError,
  SaveConsentLogRepositoryError,
} from './SaveConsentLogUsecase'
import type { SaveConsentLogDeps } from './SaveConsentLogUsecase'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'

const createMockApplication = () =>
  Application.reconstruct({
    id: ApplicationId.fromString('app-1'),
    jobId: JobId.fromString('job-1'),
    schemaVersionId: JobSchemaVersionId.fromString('schema-1'),
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
    createdAt: new Date(),
    updatedAt: new Date(),
  })

describe('SaveConsentLogUsecase', () => {
  const createDeps = (overrides?: Partial<IApplicationRepository>): SaveConsentLogDeps => ({
    applicationRepository: {
      findById: vi.fn().mockResolvedValue(Result.ok(createMockApplication())),
      saveConsentLog: vi.fn().mockResolvedValue(Result.ok(undefined)),
      ...overrides,
    } as unknown as IApplicationRepository,
  })

  describe('正常系', () => {
    it('ConsentLogを保存できる', async () => {
      const deps = createDeps()
      const usecase = new SaveConsentLogUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        consentType: 'data_usage',
        consentLogId: 'cl-1',
        consented: true,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.consentType.value).toBe('data_usage')
        expect(result.value.consented).toBe(true)
        expect(result.value.ipAddress).toBe('127.0.0.1')
        expect(result.value.userAgent).toBe('test-agent')
      }
    })

    it('ipAddress, userAgent が未指定の場合 null になる', async () => {
      const deps = createDeps()
      const usecase = new SaveConsentLogUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        consentType: 'privacy_policy',
        consentLogId: 'cl-2',
        consented: true,
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.ipAddress).toBeNull()
        expect(result.value.userAgent).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('不正な consentType でバリデーションエラーを返す', async () => {
      const deps = createDeps()
      const usecase = new SaveConsentLogUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        consentType: 'invalid_type',
        consentLogId: 'cl-1',
        consented: true,
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveConsentLogValidationError)
      }
    })

    it('Application 取得に失敗した場合リポジトリエラーを返す', async () => {
      const deps = createDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new SaveConsentLogUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        consentType: 'data_usage',
        consentLogId: 'cl-1',
        consented: true,
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveConsentLogRepositoryError)
      }
    })

    it('ConsentLog 保存に失敗した場合リポジトリエラーを返す', async () => {
      const deps = createDeps({
        saveConsentLog: vi.fn().mockResolvedValue(Result.err(new Error('Save failed'))),
      })
      const usecase = new SaveConsentLogUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        consentType: 'data_usage',
        consentLogId: 'cl-1',
        consented: true,
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveConsentLogRepositoryError)
      }
    })
  })
})
