import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { TriggerManualFallbackUsecase } from './TriggerManualFallbackUsecase'
import { TriggerManualFallbackRepositoryError } from './TriggerManualFallbackUsecase'
import type { TriggerManualFallbackDeps } from './TriggerManualFallbackUsecase'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationTodo } from '../../../domain/entity/ApplicationTodo/ApplicationTodo'
import { FallbackService } from '../../../domain/service/FallbackService/FallbackService'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import { ApplicationTodoId } from '../../../domain/valueObject/ApplicationTodoId/ApplicationTodoId'
import { FieldFactDefinitionId } from '../../../domain/valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { TodoStatus } from '../../../domain/valueObject/TodoStatus/TodoStatus'

const createMockApplication = () =>
  Application.reconstruct({
    id: ApplicationId.fromString('app-1'),
    jobId: JobId.fromString('job-1'),
    schemaVersionId: JobSchemaVersionId.fromString('schema-1'),
    applicantName: null,
    applicantEmail: null,
    language: null,
    country: null,
    timezone: null,
    status: ApplicationStatus.new(),
    meetLink: null,
    extractionReviewedAt: null,
    consentCheckedAt: null,
    submittedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

const createMockTodo = (id: string, status: TodoStatus) =>
  ApplicationTodo.reconstruct({
    id: ApplicationTodoId.fromString(id),
    applicationId: ApplicationId.fromString('app-1'),
    fieldFactDefinitionId: FieldFactDefinitionId.fromString('ffd-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    fact: 'test fact',
    doneCriteria: 'test criteria',
    required: true,
    status,
    extractedValue: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

describe('TriggerManualFallbackUsecase', () => {
  const createDeps = (
    appOverrides?: Partial<IApplicationRepository>,
    eventOverrides?: Partial<IEventLogRepository>
  ): TriggerManualFallbackDeps => ({
    applicationRepository: {
      findById: vi.fn().mockResolvedValue(Result.ok(createMockApplication())),
      findTodosByApplicationId: vi
        .fn()
        .mockResolvedValue(
          Result.ok([
            createMockTodo('todo-1', TodoStatus.pending()),
            createMockTodo('todo-2', TodoStatus.validating()),
            createMockTodo('todo-3', TodoStatus.done()),
          ])
        ),
      saveTodos: vi.fn().mockResolvedValue(Result.ok(undefined)),
      ...appOverrides,
    } as unknown as IApplicationRepository,
    eventLogRepository: {
      create: vi.fn().mockResolvedValue(Result.ok(undefined)),
      ...eventOverrides,
    } as unknown as IEventLogRepository,
    fallbackService: new FallbackService(),
  })

  describe('正常系', () => {
    it('未完了Todoをmanual_inputに遷移しイベントを記録する', async () => {
      const deps = createDeps()
      const usecase = new TriggerManualFallbackUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        eventLogId: 'el-1',
      })

      expect(Result.isOk(result)).toBe(true)

      // saveTodosが呼ばれたことを確認
      const saveTodosCall = (deps.applicationRepository.saveTodos as ReturnType<typeof vi.fn>).mock
        .calls[0][0]
      // pending と validating のTodoが manual_input に遷移
      const pendingTodo = saveTodosCall.find((t: ApplicationTodo) => t.id.value === 'todo-1')
      const validatingTodo = saveTodosCall.find((t: ApplicationTodo) => t.id.value === 'todo-2')
      const doneTodo = saveTodosCall.find((t: ApplicationTodo) => t.id.value === 'todo-3')
      expect(pendingTodo.status.value).toBe('manual_input')
      expect(validatingTodo.status.value).toBe('manual_input')
      expect(doneTodo.status.value).toBe('done') // done はそのまま

      // EventLog が記録されたことを確認
      expect(deps.eventLogRepository.create).toHaveBeenCalled()
    })
  })

  describe('異常系', () => {
    it('Application 取得失敗でリポジトリエラーを返す', async () => {
      const deps = createDeps({
        findById: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new TriggerManualFallbackUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        eventLogId: 'el-1',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(TriggerManualFallbackRepositoryError)
      }
    })

    it('Todo 取得失敗でリポジトリエラーを返す', async () => {
      const deps = createDeps({
        findTodosByApplicationId: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new TriggerManualFallbackUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        eventLogId: 'el-1',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(TriggerManualFallbackRepositoryError)
      }
    })

    it('Todo 保存失敗でリポジトリエラーを返す', async () => {
      const deps = createDeps({
        saveTodos: vi.fn().mockResolvedValue(Result.err(new Error('Save failed'))),
      })
      const usecase = new TriggerManualFallbackUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        eventLogId: 'el-1',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(TriggerManualFallbackRepositoryError)
      }
    })

    it('イベントログ保存失敗でリポジトリエラーを返す', async () => {
      const deps = createDeps(undefined, {
        create: vi.fn().mockResolvedValue(Result.err(new Error('Event save failed'))),
      })
      const usecase = new TriggerManualFallbackUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        eventLogId: 'el-1',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(TriggerManualFallbackRepositoryError)
      }
    })
  })
})
