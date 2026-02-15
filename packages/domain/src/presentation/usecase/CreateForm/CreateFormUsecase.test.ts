import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import {
  CreateFormUsecase,
  CreateFormValidationError,
  CreateFormRepositoryError,
  type CreateFormDeps,
  type CreateFormInput,
} from './CreateFormUsecase'

const createMockDeps = (overrides?: Partial<IFormRepository>): CreateFormDeps => ({
  formRepository: {
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
    saveFormFields: vi.fn().mockResolvedValue(Result.ok(undefined)),
    saveSchemaVersion: vi.fn().mockResolvedValue(Result.ok(undefined)),
    findById: vi.fn(),
    findAll: vi.fn(),
    findByUserId: vi.fn(),
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
  generateId: vi.fn().mockReturnValue('test-uuid'),
})

const createValidInput = (overrides?: Partial<CreateFormInput>): CreateFormInput => ({
  title: 'Test Form',
  description: 'Test description',
  purpose: 'Test purpose',
  completionMessage: 'Thank you!',
  userId: 'user-123',
  fields: [
    {
      label: 'Name',
      description: 'Your name',
      intent: 'collect name',
      required: true,
    },
  ],
  ...overrides,
})

describe('CreateFormUsecase', () => {
  describe('正常系', () => {
    it('フォームを作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput()

      const result = await usecase.execute(input)

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.title).toBe('Test Form')
        expect(result.value.description).toBe('Test description')
      }
      expect(deps.formRepository.save).toHaveBeenCalledTimes(1)
      expect(deps.formRepository.saveFormFields).toHaveBeenCalledTimes(1)
      expect(deps.formRepository.saveSchemaVersion).toHaveBeenCalledTimes(1)
    })

    it('フィールドなしでもフォームを作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput({ fields: [] })

      const result = await usecase.execute(input)

      expect(Result.isOk(result)).toBe(true)
      expect(deps.formRepository.save).toHaveBeenCalledTimes(1)
      expect(deps.formRepository.saveFormFields).not.toHaveBeenCalled()
      expect(deps.formRepository.saveSchemaVersion).toHaveBeenCalledTimes(1)
    })

    it('複数フィールドでフォームを作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput({
        fields: [
          { label: 'Name', description: null, intent: null, required: true },
          { label: 'Email', description: null, intent: null, required: true },
          { label: 'Message', description: null, intent: null, required: false },
        ],
      })

      const result = await usecase.execute(input)

      expect(Result.isOk(result)).toBe(true)
      expect(deps.formRepository.saveFormFields).toHaveBeenCalledTimes(1)
      const savedFields = vi.mocked(deps.formRepository.saveFormFields).mock.calls[0][0]
      expect(savedFields).toHaveLength(3)
      expect(savedFields[0].label).toBe('Name')
      expect(savedFields[1].label).toBe('Email')
      expect(savedFields[2].label).toBe('Message')
    })
  })

  describe('異常系', () => {
    it('titleが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput({ title: '' })

      const result = await usecase.execute(input)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateFormValidationError)
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('title is required')
      }
    })

    it('userIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput({ userId: '' })

      const result = await usecase.execute(input)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateFormValidationError)
        expect(result.error.message).toContain('userId is required')
      }
    })

    it('フィールドのlabelが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput({
        fields: [{ label: '', description: null, intent: null, required: true }],
      })

      const result = await usecase.execute(input)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateFormValidationError)
        expect(result.error.message).toContain('fields[0].label is required')
      }
    })

    it('複数のバリデーションエラーをまとめて返す', async () => {
      const deps = createMockDeps()
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput({
        title: '',
        userId: '',
        fields: [{ label: '', description: null, intent: null, required: true }],
      })

      const result = await usecase.execute(input)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.message).toContain('title is required')
        expect(result.error.message).toContain('userId is required')
        expect(result.error.message).toContain('fields[0].label is required')
      }
    })

    it('フォーム保存失敗でリポジトリエラー', async () => {
      const deps = createMockDeps({
        save: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput()

      const result = await usecase.execute(input)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateFormRepositoryError)
        expect(result.error.type).toBe('repository_error')
        expect(result.error.message).toBe('DB error')
      }
    })

    it('フィールド保存失敗でリポジトリエラー', async () => {
      const deps = createMockDeps({
        saveFormFields: vi.fn().mockResolvedValue(Result.err(new Error('Fields save error'))),
      })
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput()

      const result = await usecase.execute(input)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateFormRepositoryError)
        expect(result.error.message).toBe('Fields save error')
      }
    })

    it('スキーマバージョン保存失敗でリポジトリエラー', async () => {
      const deps = createMockDeps({
        saveSchemaVersion: vi.fn().mockResolvedValue(Result.err(new Error('Schema save error'))),
      })
      const usecase = new CreateFormUsecase(deps)
      const input = createValidInput()

      const result = await usecase.execute(input)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateFormRepositoryError)
        expect(result.error.message).toBe('Schema save error')
      }
    })
  })
})
