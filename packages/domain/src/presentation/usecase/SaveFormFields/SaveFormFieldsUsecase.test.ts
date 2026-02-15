import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import {
  SaveFormFieldsUsecase,
  SaveFormFieldsNotFoundError,
  SaveFormFieldsForbiddenError,
  SaveFormFieldsRepositoryError,
  type SaveFormFieldsDeps,
} from './SaveFormFieldsUsecase'

const createMockForm = (overrides?: { createdBy?: string }): Form => {
  const now = new Date()
  return Form.create({
    id: FormId.fromString('form-1'),
    title: 'Test Form',
    description: null,
    purpose: null,
    completionMessage: null,
    status: FormStatus.draft(),
    createdBy: UserId.fromString(overrides?.createdBy ?? 'user-123'),
    createdAt: now,
    updatedAt: now,
  })
}

const createMockDeps = (overrides?: Partial<IFormRepository>): SaveFormFieldsDeps => ({
  formRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockForm())),
    deleteFormFieldsByFormId: vi.fn().mockResolvedValue(Result.ok(undefined)),
    saveFormFields: vi.fn().mockResolvedValue(Result.ok(undefined)),
    save: vi.fn(),
    findByUserId: vi.fn(),
    saveSchemaVersion: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    findFormFieldsByFormId: vi.fn(),
    saveFormField: vi.fn(),
    findSchemaVersionById: vi.fn(),
    findSchemaVersionsByFormId: vi.fn(),
    findLatestSchemaVersionByFormId: vi.fn(),
    findCompletionCriteriaBySchemaVersionId: vi.fn(),
    saveCompletionCriteria: vi.fn(),
    ...overrides,
  } as IFormRepository,
  generateId: vi.fn().mockReturnValue('generated-uuid'),
})

describe('SaveFormFieldsUsecase', () => {
  describe('正常系', () => {
    it('フィールドを保存できる', async () => {
      const deps = createMockDeps()
      const usecase = new SaveFormFieldsUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        fields: [
          { label: 'Name', description: null, intent: null, required: true },
          { label: 'Email', description: null, intent: null, required: true },
        ],
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(2)
        expect(result.value[0].label).toBe('Name')
        expect(result.value[1].label).toBe('Email')
      }
      expect(deps.formRepository.deleteFormFieldsByFormId).toHaveBeenCalledTimes(1)
      expect(deps.formRepository.saveFormFields).toHaveBeenCalledTimes(1)
    })

    it('既存フィールドIDを維持して保存できる', async () => {
      const deps = createMockDeps()
      const usecase = new SaveFormFieldsUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        fields: [
          {
            id: 'existing-field-id',
            label: 'Name',
            description: null,
            intent: null,
            required: true,
          },
        ],
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value[0].id.value).toBe('existing-field-id')
      }
    })

    it('空のフィールドリストで保存できる', async () => {
      const deps = createMockDeps()
      const usecase = new SaveFormFieldsUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        fields: [],
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(0)
      }
      expect(deps.formRepository.deleteFormFieldsByFormId).toHaveBeenCalledTimes(1)
      expect(deps.formRepository.saveFormFields).not.toHaveBeenCalled()
    })
  })

  describe('異常系', () => {
    it('存在しないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
      })
      const usecase = new SaveFormFieldsUsecase(deps)

      const result = await usecase.execute({
        formId: 'non-existent',
        userId: 'user-123',
        fields: [],
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveFormFieldsNotFoundError)
      }
    })

    it('所有者以外が保存しようとするとForbiddenError', async () => {
      const deps = createMockDeps({
        findById: vi.fn().mockResolvedValue(Result.ok(createMockForm({ createdBy: 'owner-user' }))),
      })
      const usecase = new SaveFormFieldsUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'other-user',
        fields: [],
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveFormFieldsForbiddenError)
      }
    })

    it('保存失敗でRepositoryError', async () => {
      const deps = createMockDeps({
        saveFormFields: vi.fn().mockResolvedValue(Result.err(new Error('Save failed'))),
      })
      const usecase = new SaveFormFieldsUsecase(deps)

      const result = await usecase.execute({
        formId: 'form-1',
        userId: 'user-123',
        fields: [{ label: 'Name', description: null, intent: null, required: true }],
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SaveFormFieldsRepositoryError)
      }
    })
  })
})
