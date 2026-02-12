import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { UpdateExtractedFieldUsecase } from './UpdateExtractedFieldUsecase'
import {
  UpdateExtractedFieldNotFoundError,
  UpdateExtractedFieldRepositoryError,
} from './UpdateExtractedFieldUsecase'
import type { UpdateExtractedFieldDeps } from './UpdateExtractedFieldUsecase'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import { ExtractedField } from '../../../domain/entity/ExtractedField/ExtractedField'
import { ExtractedFieldId } from '../../../domain/valueObject/ExtractedFieldId/ExtractedFieldId'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { ExtractedFieldSource } from '../../../domain/valueObject/ExtractedFieldSource/ExtractedFieldSource'

const createMockExtractedField = (id: string, value: string) =>
  ExtractedField.reconstruct({
    id: ExtractedFieldId.fromString(id),
    applicationId: ApplicationId.fromString('app-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    value,
    source: ExtractedFieldSource.llm(),
    confirmed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

describe('UpdateExtractedFieldUsecase', () => {
  const createDeps = (overrides?: Partial<IApplicationRepository>): UpdateExtractedFieldDeps => ({
    applicationRepository: {
      findExtractedFieldsByApplicationId: vi
        .fn()
        .mockResolvedValue(
          Result.ok([
            createMockExtractedField('ef-1', 'old value'),
            createMockExtractedField('ef-2', 'other'),
          ])
        ),
      saveExtractedField: vi.fn().mockResolvedValue(Result.ok(undefined)),
      ...overrides,
    } as unknown as IApplicationRepository,
  })

  describe('正常系', () => {
    it('ExtractedField の値を更新できる', async () => {
      const deps = createDeps()
      const usecase = new UpdateExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-1',
        newValue: 'new value',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.value).toBe('new value')
        expect(result.value.source.value).toBe('manual')
        expect(result.value.confirmed).toBe(false)
      }
    })
  })

  describe('異常系', () => {
    it('存在しない ExtractedFieldId で NotFoundError を返す', async () => {
      const deps = createDeps()
      const usecase = new UpdateExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'nonexistent',
        newValue: 'new value',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateExtractedFieldNotFoundError)
      }
    })

    it('フィールド一覧取得失敗でリポジトリエラーを返す', async () => {
      const deps = createDeps({
        findExtractedFieldsByApplicationId: vi
          .fn()
          .mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new UpdateExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-1',
        newValue: 'new value',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateExtractedFieldRepositoryError)
      }
    })

    it('保存失敗でリポジトリエラーを返す', async () => {
      const deps = createDeps({
        saveExtractedField: vi.fn().mockResolvedValue(Result.err(new Error('Save failed'))),
      })
      const usecase = new UpdateExtractedFieldUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        extractedFieldId: 'ef-1',
        newValue: 'new value',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateExtractedFieldRepositoryError)
      }
    })
  })
})
