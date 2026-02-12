import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationTodo } from '../../../domain/entity/ApplicationTodo/ApplicationTodo'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ApplicationTodoId } from '../../../domain/valueObject/ApplicationTodoId/ApplicationTodoId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { FieldFactDefinitionId } from '../../../domain/valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import { TodoStatus } from '../../../domain/valueObject/TodoStatus/TodoStatus'
import { ApplicationSubmissionService } from '../../../domain/service/ApplicationSubmissionService/ApplicationSubmissionService'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import {
  SubmitApplicationUsecase,
  SubmitApplicationRepositoryError,
  SubmitApplicationValidationError,
  type SubmitApplicationDeps,
} from './SubmitApplicationUsecase'

const createMockApplication = (
  overrides: {
    extractionReviewedAt?: Date | null
    consentCheckedAt?: Date | null
  } = {}
): Application => {
  const now = new Date()
  return Application.reconstruct({
    id: ApplicationId.fromString('app-1'),
    jobId: JobId.fromString('job-1'),
    schemaVersionId: JobSchemaVersionId.fromString('sv-1'),
    applicantName: null,
    applicantEmail: null,
    language: null,
    country: null,
    timezone: null,
    status: ApplicationStatus.new(),
    meetLink: null,
    extractionReviewedAt:
      'extractionReviewedAt' in overrides ? overrides.extractionReviewedAt! : now,
    consentCheckedAt: 'consentCheckedAt' in overrides ? overrides.consentCheckedAt! : now,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

const createMockTodo = (id: string, required: boolean, status: TodoStatus): ApplicationTodo => {
  const now = new Date()
  return ApplicationTodo.reconstruct({
    id: ApplicationTodoId.fromString(id),
    applicationId: ApplicationId.fromString('app-1'),
    fieldFactDefinitionId: FieldFactDefinitionId.fromString('ffd-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    fact: 'Test fact',
    doneCriteria: 'Test criteria',
    required,
    status,
    extractedValue: status.isDone() ? 'extracted' : null,
    createdAt: now,
    updatedAt: now,
  })
}

const createMockDeps = (
  application: Application = createMockApplication(),
  todos: ApplicationTodo[] = [createMockTodo('todo-1', true, TodoStatus.done())]
): SubmitApplicationDeps => ({
  applicationRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(application)),
    findTodosByApplicationId: vi.fn().mockResolvedValue(Result.ok(todos)),
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
  } as unknown as IApplicationRepository,
  submissionService: new ApplicationSubmissionService(),
})

describe('SubmitApplicationUsecase', () => {
  describe('正常系', () => {
    it('全条件を満たしている場合、応募を確定できる', async () => {
      const deps = createMockDeps()
      const usecase = new SubmitApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.submittedAt).not.toBeNull()
      }
      expect(deps.applicationRepository.save).toHaveBeenCalled()
    })

    it('optional Todoが未完了でも応募を確定できる', async () => {
      const todos = [
        createMockTodo('todo-1', true, TodoStatus.done()),
        createMockTodo('todo-2', false, TodoStatus.pending()),
      ]
      const deps = createMockDeps(createMockApplication(), todos)
      const usecase = new SubmitApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isOk(result)).toBe(true)
    })
  })

  describe('異常系', () => {
    it('抽出確認が未完了の場合エラーを返す', async () => {
      const application = createMockApplication({ extractionReviewedAt: null })
      const deps = createMockDeps(application)
      const usecase = new SubmitApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SubmitApplicationValidationError)
        expect((result.error as SubmitApplicationValidationError).submissionError.type).toBe(
          'EXTRACTION_NOT_REVIEWED'
        )
      }
    })

    it('同意チェックが未完了の場合エラーを返す', async () => {
      const application = createMockApplication({ consentCheckedAt: null })
      const deps = createMockDeps(application)
      const usecase = new SubmitApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SubmitApplicationValidationError)
        expect((result.error as SubmitApplicationValidationError).submissionError.type).toBe(
          'CONSENT_NOT_CHECKED'
        )
      }
    })

    it('required Todoが未完了の場合エラーを返す', async () => {
      const todos = [createMockTodo('todo-1', true, TodoStatus.pending())]
      const deps = createMockDeps(createMockApplication(), todos)
      const usecase = new SubmitApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SubmitApplicationValidationError)
        expect((result.error as SubmitApplicationValidationError).submissionError.type).toBe(
          'REQUIRED_TODOS_INCOMPLETE'
        )
      }
    })

    it('リポジトリエラーの場合エラーを返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.applicationRepository.findById).mockResolvedValue(
        Result.err(new Error('Not found'))
      )
      const usecase = new SubmitApplicationUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SubmitApplicationRepositoryError)
      }
    })
  })
})
