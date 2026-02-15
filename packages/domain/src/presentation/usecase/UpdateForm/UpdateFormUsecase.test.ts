import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import {
  UpdateFormUsecase,
  UpdateFormNotFoundError,
  UpdateFormForbiddenError,
  UpdateFormRepositoryError,
  type UpdateFormDeps,
} from './UpdateFormUsecase'

const createMockForm = (overrides?: { createdBy?: string }): Form => {
  const now = new Date()
  return Form.create({
    id: FormId.fromString('form-1'),
    title: 'Original Title',
    description: 'Original Description',
    purpose: 'Original Purpose',
    completionMessage: 'Original Message',
    status: FormStatus.draft(),
    createdBy: UserId.fromString(overrides?.createdBy ?? 'user-123'),
    createdAt: now,
    updatedAt: now,
  })
}

const createMockDeps = (overrides?: Partial<IFormRepository>): UpdateFormDeps => ({
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

describe('UpdateFormUsecase', () => {
  describe('正常系', () => {
    it('フォームのタイトルを更新できる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateFormUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        title: 'New Title',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.title).toBe('New Title')
      }
      expect(deps.formRepository.save).toHaveBeenCalledTimes(1)
    })

    it('複数のフィールドを同時に更新できる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateFormUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        title: 'New Title',
        description: 'New Description',
        purpose: 'New Purpose',
        completionMessage: 'New Message',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.title).toBe('New Title')
        expect(result.value.description).toBe('New Description')
        expect(result.value.purpose).toBe('New Purpose')
        expect(result.value.completionMessage).toBe('New Message')
      }
    })

    it('フィールドをnullに更新できる', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateFormUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        description: null,
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.description).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('存在しないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
      })
      const usecase = new UpdateFormUsecase(deps)

      const result = await usecase.execute({
        formId: 'non-existent',
        userId: 'user-123',
        title: 'New Title',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateFormNotFoundError)
        expect(result.error.type).toBe('not_found_error')
      }
    })

    it('所有者以外が更新しようとするとForbiddenError', async () => {
      const form = createMockForm({ createdBy: 'owner-user' })
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(form)),
      })
      const usecase = new UpdateFormUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'other-user',
        title: 'New Title',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateFormForbiddenError)
        expect(result.error.type).toBe('forbidden_error')
      }
    })

    it('保存失敗でRepositoryError', async () => {
      const deps = createMockDeps({
        save: vi.fn().mockResolvedValue(Result.err(new Error('Save failed'))),
      })
      const usecase = new UpdateFormUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        title: 'New Title',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateFormRepositoryError)
        expect(result.error.type).toBe('repository_error')
      }
    })
  })
})
