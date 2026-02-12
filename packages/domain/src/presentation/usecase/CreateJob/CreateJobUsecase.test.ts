import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { CreateJobUsecase } from './CreateJobUsecase'
import { CreateJobValidationError, CreateJobRepositoryError } from './CreateJobUsecase'
import type { CreateJobDeps, CreateJobInput } from './CreateJobUsecase'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'

const createMockDeps = (overrides?: Partial<IJobRepository>): CreateJobDeps => ({
  jobRepository: {
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
    saveFormFields: vi.fn().mockResolvedValue(Result.ok(undefined)),
    saveSchemaVersion: vi.fn().mockResolvedValue(Result.ok(undefined)),
    findById: vi.fn(),
    findByCreatedBy: vi.fn(),
    delete: vi.fn(),
    findFormFieldsByJobId: vi.fn(),
    saveFormField: vi.fn(),
    findSchemaVersionsByJobId: vi.fn(),
    findLatestSchemaVersion: vi.fn(),
    findFactDefinitionsBySchemaVersionId: vi.fn(),
    saveFactDefinitions: vi.fn(),
    findProhibitedTopicsBySchemaVersionId: vi.fn(),
    saveProhibitedTopics: vi.fn(),
    ...overrides,
  } as unknown as IJobRepository,
  generateId: vi.fn().mockReturnValue('test-id-123'),
})

const validInput: CreateJobInput = {
  title: 'Senior Engineer',
  idealCandidate: 'Experienced with TypeScript',
  cultureContext: 'Remote-first, async communication',
  userId: 'user-1',
  formFields: [
    { label: 'Motivation', intent: 'Culture fit', required: true },
    { label: 'Experience', intent: null, required: false },
  ],
}

describe('CreateJobUsecase', () => {
  describe('正常系', () => {
    it('求人を作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.title).toBe('Senior Engineer')
        expect(result.value.idealCandidate).toBe('Experienced with TypeScript')
        expect(result.value.cultureContext).toBe('Remote-first, async communication')
        expect(result.value.status.isDraft()).toBe(true)
      }
    })

    it('リポジトリのsaveが呼ばれる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      await usecase.execute(validInput)

      expect(deps.jobRepository.save).toHaveBeenCalledTimes(1)
    })

    it('フォームフィールドが保存される', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      await usecase.execute(validInput)

      expect(deps.jobRepository.saveFormFields).toHaveBeenCalledTimes(1)
    })

    it('スキーマバージョンが作成される', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      await usecase.execute(validInput)

      expect(deps.jobRepository.saveSchemaVersion).toHaveBeenCalledTimes(1)
    })

    it('フォームフィールドが空の場合もJobは作成できる', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute({ ...validInput, formFields: [] })

      expect(Result.isOk(result)).toBe(true)
      expect(deps.jobRepository.saveFormFields).not.toHaveBeenCalled()
    })
  })

  describe('異常系', () => {
    it('titleが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute({ ...validInput, title: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateJobValidationError)
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('userIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute({ ...validInput, userId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateJobValidationError)
      }
    })

    it('フォームフィールドのlabelが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute({
        ...validInput,
        formFields: [{ label: '', intent: null, required: true }],
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateJobValidationError)
      }
    })

    it('リポジトリのsaveが失敗した場合リポジトリエラー', async () => {
      const deps = createMockDeps({
        save: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateJobRepositoryError)
        expect(result.error.type).toBe('repository_error')
      }
    })

    it('フォームフィールドの保存が失敗した場合リポジトリエラー', async () => {
      const deps = createMockDeps({
        saveFormFields: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateJobRepositoryError)
      }
    })

    it('スキーマバージョンの保存が失敗した場合リポジトリエラー', async () => {
      const deps = createMockDeps({
        saveSchemaVersion: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new CreateJobUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(CreateJobRepositoryError)
      }
    })
  })
})
