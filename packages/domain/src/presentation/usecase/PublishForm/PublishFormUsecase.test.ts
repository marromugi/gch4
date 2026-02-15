import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import {
  PublishFormUsecase,
  PublishFormNotFoundError,
  PublishFormForbiddenError,
  PublishFormBusinessError,
  type PublishFormDeps,
} from './PublishFormUsecase'

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

const createMockDeps = (overrides?: Partial<IFormRepository>): PublishFormDeps => ({
  formRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockForm())),
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
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
    findLatestSchemaVersionByFormId: vi.fn(),
    findCompletionCriteriaBySchemaVersionId: vi.fn(),
    saveCompletionCriteria: vi.fn(),
    ...overrides,
  } as IFormRepository,
})

describe('PublishFormUsecase', () => {
  describe('正常系', () => {
    it('ドラフトフォームを公開できる', async () => {
      const form = createMockForm({ status: 'draft' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new PublishFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.equals(FormStatus.published())).toBe(true)
      }
      expect(deps.formRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('異常系', () => {
    it('存在しないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
      })
      const usecase = new PublishFormUsecase(deps)

      const result = await usecase.execute({ formId: 'non-existent', userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(PublishFormNotFoundError)
        expect(result.error.type).toBe('not_found_error')
      }
    })

    it('所有者以外が公開しようとするとForbiddenError', async () => {
      const form = createMockForm({ createdBy: 'owner-user' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new PublishFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(PublishFormForbiddenError)
        expect(result.error.type).toBe('forbidden_error')
      }
    })

    it('既に公開済みのフォームを公開しようとするとBusinessError', async () => {
      const form = createMockForm({ status: 'published' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new PublishFormUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(PublishFormBusinessError)
        expect(result.error.type).toBe('business_error')
      }
    })
  })
})
