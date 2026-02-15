import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormSchemaVersion } from '../../../domain/entity/FormSchemaVersion/FormSchemaVersion'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormSchemaVersionId } from '../../../domain/valueObject/FormSchemaVersionId/FormSchemaVersionId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { FormSchemaVersionStatus } from '../../../domain/valueObject/FormSchemaVersionStatus/FormSchemaVersionStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import {
  GetFormSchemaUsecase,
  GetFormSchemaNotFoundError,
  GetFormSchemaForbiddenError,
  type GetFormSchemaDeps,
} from './GetFormSchemaUsecase'

const createMockForm = (overrides?: {
  createdBy?: string
  status?: 'draft' | 'published'
}): Form => {
  const now = new Date()
  const status = overrides?.status === 'published' ? FormStatus.published() : FormStatus.draft()
  return Form.create({
    id: FormId.fromString('form-1'),
    title: 'Test Form',
    description: null,
    purpose: null,
    completionMessage: null,
    status,
    createdBy: UserId.fromString(overrides?.createdBy ?? 'user-123'),
    createdAt: now,
    updatedAt: now,
  })
}

const createMockSchemaVersion = (): FormSchemaVersion => {
  const now = new Date()
  return FormSchemaVersion.create({
    id: FormSchemaVersionId.fromString('schema-1'),
    formId: FormId.fromString('form-1'),
    version: 1,
    status: FormSchemaVersionStatus.draft(),
    approvedAt: null,
    createdAt: now,
  })
}

const createMockDeps = (overrides?: Partial<IFormRepository>): GetFormSchemaDeps => ({
  formRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockForm())),
    findLatestSchemaVersionByFormId: vi
      .fn()
      .mockResolvedValue(Result.ok(createMockSchemaVersion())),
    findCompletionCriteriaBySchemaVersionId: vi.fn().mockResolvedValue(Result.ok([])),
    save: vi.fn(),
    findByUserId: vi.fn(),
    saveFormFields: vi.fn(),
    saveSchemaVersion: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    findFormFieldsByFormId: vi.fn(),
    saveFormField: vi.fn(),
    deleteFormFieldsByFormId: vi.fn(),
    findSchemaVersionById: vi.fn(),
    findSchemaVersionsByFormId: vi.fn(),
    saveCompletionCriteria: vi.fn(),
    ...overrides,
  } as IFormRepository,
})

describe('GetFormSchemaUsecase', () => {
  describe('正常系', () => {
    it('所有者はスキーマを取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new GetFormSchemaUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.schemaVersion).toBeDefined()
        expect(result.value.completionCriteria).toBeDefined()
      }
    })

    it('公開済みフォームのスキーマは誰でも取得できる', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(createMockForm({ status: 'published' }))),
      })
      const usecase = new GetFormSchemaUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isOk(result)).toBe(true)
    })
  })

  describe('異常系', () => {
    it('存在しないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
      })
      const usecase = new GetFormSchemaUsecase(deps)

      const result = await usecase.execute({ formId: 'non-existent', userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormSchemaNotFoundError)
      }
    })

    it('スキーマがないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        findLatestSchemaVersionByFormId: vi.fn().mockResolvedValue(Result.ok(null)),
      })
      const usecase = new GetFormSchemaUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormSchemaNotFoundError)
        expect(result.error.message).toBe('No schema version found')
      }
    })

    it('所有者以外がドラフトフォームにアクセスするとForbiddenError', async () => {
      const deps = createMockDeps({
        findById: vi
          .fn()
          .mockResolvedValue(Result.ok(createMockForm({ createdBy: 'owner', status: 'draft' }))),
      })
      const usecase = new GetFormSchemaUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormSchemaForbiddenError)
      }
    })
  })
})
