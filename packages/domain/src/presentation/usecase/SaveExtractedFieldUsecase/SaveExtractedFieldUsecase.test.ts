import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { SaveExtractedFieldUsecase } from './SaveExtractedFieldUsecase'
import {
  SaveExtractedFieldValidationError,
  SaveExtractedFieldRepositoryError,
} from './SaveExtractedFieldUsecase'
import type { SaveExtractedFieldDeps } from './SaveExtractedFieldUsecase'
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

describe('SaveExtractedFieldUsecase', () => {
  const createDeps = (overrides?: Partial<IApplicationRepository>): SaveExtractedFieldDeps => ({
    applicationRepository: {
      findById: vi.fn().mockResolvedValue(Result.ok(createMockApplication())),
      saveExtractedField: vi.fn().mockResolvedValue(Result.ok(undefined)),
      ...overrides,
    } as unknown as IApplicationRepository,
  })

  describe('正常系', () => {
    it('ExtractedField を保存できる（llm source）', async () => {
      const deps = createDeps()
      const usecase = new SaveExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-1',
        jobFormFieldId: 'jff-1',
        value: 'John Doe',
        source: 'llm',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.value).toBe('John Doe')
        expect(result.value.source.value).toBe('llm')
        expect(result.value.confirmed).toBe(false)
      }
    })

    it('ExtractedField を保存できる（manual source）', async () => {
      const deps = createDeps()
      const usecase = new SaveExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-2',
        jobFormFieldId: 'jff-1',
        value: 'Jane Doe',
        source: 'manual',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.value).toBe('Jane Doe')
        expect(result.value.source.value).toBe('manual')
      }
    })
  })

  describe('異常系', () => {
    it('不正な source でバリデーションエラーを返す', async () => {
      const deps = createDeps()
      const usecase = new SaveExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-1',
        jobFormFieldId: 'jff-1',
        value: 'test',
        source: 'invalid_source',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveExtractedFieldValidationError)
      }
    })

    it('Application 取得に失敗した場合リポジトリエラーを返す', async () => {
      const deps = createDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new SaveExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-1',
        jobFormFieldId: 'jff-1',
        value: 'test',
        source: 'llm',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveExtractedFieldRepositoryError)
      }
    })

    it('ExtractedField 保存に失敗した場合リポジトリエラーを返す', async () => {
      const deps = createDeps({
        saveExtractedField: vi.fn().mockResolvedValue(Result.err(new Error('Save failed'))),
      })
      const usecase = new SaveExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-1',
        jobFormFieldId: 'jff-1',
        value: 'test',
        source: 'llm',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveExtractedFieldRepositoryError)
      }
    })
  })
})
