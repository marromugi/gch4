import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import {
  GetFormUsecase,
  GetFormNotFoundError,
  GetFormForbiddenError,
  type GetFormDeps,
} from './GetFormUsecase'

const createMockForm = (overrides?: {
  id?: string
  status?: 'draft' | 'published'
  createdBy?: string
}): Form => {
  const now = new Date()
  const status = overrides?.status === 'published' ? FormStatus.published() : FormStatus.draft()
  return Form.create({
    id: FormId.fromString(overrides?.id ?? 'form-1'),
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

const createMockDeps = (overrides?: Partial<IFormRepository>): GetFormDeps => ({
  formRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockForm())),
    findByUserId: vi.fn(),
    save: vi.fn(),
    saveFormFields: vi.fn(),
    saveSchemaVersion: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    findFormFieldsByFormId: vi.fn(),
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

describe('GetFormUsecase', () => {
  describe('正常系', () => {
    it('所有者はドラフトフォームを取得できる', async () => {
      const form = createMockForm({ createdBy: 'user-123', status: 'draft' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new GetFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.id.value).toBe('form-1')
      }
    })

    it('公開済みフォームは誰でも取得できる', async () => {
      const form = createMockForm({ createdBy: 'owner-user', status: 'published' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new GetFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isOk(result)).toBe(true)
    })

    it('未認証ユーザーも公開済みフォームを取得できる', async () => {
      const form = createMockForm({ status: 'published' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new GetFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: null })

      expect(Result.isOk(result)).toBe(true)
    })
  })

  describe('異常系', () => {
    it('存在しないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
      })
      const usecase = new GetFormUsecase(deps)

      const result = await usecase.execute({ formId: 'non-existent', userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormNotFoundError)
        expect(result.error.type).toBe('not_found_error')
        expect(result.error.message).toContain('non-existent')
      }
    })

    it('所有者以外がドラフトフォームにアクセスするとForbiddenError', async () => {
      const form = createMockForm({ createdBy: 'owner-user', status: 'draft' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new GetFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormForbiddenError)
        expect(result.error.type).toBe('forbidden_error')
      }
    })

    it('未認証ユーザーがドラフトフォームにアクセスするとForbiddenError', async () => {
      const form = createMockForm({ status: 'draft' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new GetFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: null })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(GetFormForbiddenError)
      }
    })
  })
})
