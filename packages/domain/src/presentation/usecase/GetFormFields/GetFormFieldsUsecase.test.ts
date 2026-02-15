import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormField } from '../../../domain/entity/FormField/FormField'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormFieldId } from '../../../domain/valueObject/FormFieldId/FormFieldId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import {
  GetFormFieldsUsecase,
  GetFormFieldsNotFoundError,
  GetFormFieldsForbiddenError,
  type GetFormFieldsDeps,
} from './GetFormFieldsUsecase'

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

const createMockField = (label: string): FormField => {
  const now = new Date()
  return FormField.create({
    id: FormFieldId.fromString('field-1'),
    formId: FormId.fromString('form-1'),
    fieldId: 'field_1',
    label,
    description: null,
    intent: null,
    required: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  })
}

const createMockDeps = (overrides?: Partial<IFormRepository>): GetFormFieldsDeps => ({
  formRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockForm())),
    findFormFieldsByFormId: vi.fn().mockResolvedValue(Result.ok([])),
    save: vi.fn(),
    findByUserId: vi.fn(),
    saveFormFields: vi.fn(),
    saveSchemaVersion: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    saveFormField: vi.fn(),
    deleteFormFieldsByFormId: vi.fn(),
    findSchemaVersionById: vi.fn(),
    findSchemaVersionsByFormId: vi.fn(),
    findLatestSchemaVersionByFormId: vi.fn(),
    findCompletionCriteriaBySchemaVersionId: vi.fn(),
    saveCompletionCriteria: vi.fn(),
    ...overrides,
  } as IFormRepository,
})

describe('GetFormFieldsUsecase', () => {
  describe('正常系', () => {
    it('所有者はドラフトフォームのフィールドを取得できる', async () => {
      const fields = [createMockField('Name'), createMockField('Email')]
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(createMockForm({ createdBy: 'user-123' }))),
        findFormFieldsByFormId: vi.fn().mockResolvedValue(Result.ok(fields)),
      })
      const usecase = new GetFormFieldsUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(2)
      }
    })

    it('公開済みフォームは誰でもフィールドを取得できる', async () => {
      const fields = [createMockField('Name')]
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(createMockForm({ status: 'published' }))),
        findFormFieldsByFormId: vi.fn().mockResolvedValue(Result.ok(fields)),
      })
      const usecase = new GetFormFieldsUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isOk(result)).toBe(true)
    })

    it('未認証ユーザーも公開済みフォームのフィールドを取得できる', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(createMockForm({ status: 'published' }))),
        findFormFieldsByFormId: vi.fn().mockResolvedValue(Result.ok([])),
      })
      const usecase = new GetFormFieldsUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: null })

      expect(Result.isOk(result)).toBe(true)
    })
  })

  describe('異常系', () => {
    it('存在しないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
      })
      const usecase = new GetFormFieldsUsecase(deps)

      const result = await usecase.execute({ formId: 'non-existent', userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormFieldsNotFoundError)
      }
    })

    it('所有者以外がドラフトフォームにアクセスするとForbiddenError', async () => {
      const deps = createMockDeps({
        findById: vi
          .fn()
          .mockResolvedValue(Result.ok(createMockForm({ createdBy: 'owner', status: 'draft' }))),
      })
      const usecase = new GetFormFieldsUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormFieldsForbiddenError)
      }
    })
  })
})
