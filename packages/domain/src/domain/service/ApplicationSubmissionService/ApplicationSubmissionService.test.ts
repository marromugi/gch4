import { ApplicationSubmissionService } from './ApplicationSubmissionService'
import { Application } from '../../entity/Application/Application'
import { ApplicationTodo } from '../../entity/ApplicationTodo/ApplicationTodo'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { ApplicationTodoId } from '../../valueObject/ApplicationTodoId/ApplicationTodoId'
import { JobId } from '../../valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { FieldFactDefinitionId } from '../../valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import { ApplicationStatus } from '../../valueObject/ApplicationStatus/ApplicationStatus'
import { TodoStatus } from '../../valueObject/TodoStatus/TodoStatus'
import { Result } from '../../shared/Result/Result'

const service = new ApplicationSubmissionService()

const createApp = (overrides: Partial<Parameters<typeof Application.create>[0]> = {}) =>
  Application.create({
    id: ApplicationId.fromString('app-1'),
    jobId: JobId.fromString('job-1'),
    schemaVersionId: JobSchemaVersionId.fromString('sv-1'),
    applicantName: 'テスト太郎',
    applicantEmail: 'test@example.com',
    language: 'ja',
    country: 'JP',
    timezone: 'Asia/Tokyo',
    status: ApplicationStatus.new(),
    meetLink: null,
    extractionReviewedAt: new Date(),
    consentCheckedAt: new Date(),
    submittedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

const createTodo = (overrides: Partial<Parameters<typeof ApplicationTodo.create>[0]> = {}) =>
  ApplicationTodo.create({
    id: ApplicationTodoId.fromString('todo-1'),
    applicationId: ApplicationId.fromString('app-1'),
    fieldFactDefinitionId: FieldFactDefinitionId.fromString('ffd-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    fact: 'テストfact',
    doneCriteria: 'テスト基準',
    required: true,
    status: TodoStatus.done(),
    extractedValue: '抽出値',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

describe('ApplicationSubmissionService', () => {
  describe('validate', () => {
    it('全ての条件を満たす場合は成功する', () => {
      const app = createApp()
      const todos = [createTodo()]
      const result = service.validate(app, todos)
      expect(Result.isOk(result)).toBe(true)
    })

    it('抽出確認が未完了の場合はエラーを返す', () => {
      const app = createApp({ extractionReviewedAt: null })
      const todos = [createTodo()]
      const result = service.validate(app, todos)
      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('EXTRACTION_NOT_REVIEWED')
      }
    })

    it('同意チェックが未完了の場合はエラーを返す', () => {
      const app = createApp({ consentCheckedAt: null })
      const todos = [createTodo()]
      const result = service.validate(app, todos)
      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('CONSENT_NOT_CHECKED')
      }
    })

    it('requiredなTodoが未完了の場合はエラーを返す', () => {
      const app = createApp()
      const todos = [
        createTodo(),
        createTodo({
          id: ApplicationTodoId.fromString('todo-2'),
          required: true,
          status: TodoStatus.pending(),
        }),
      ]
      const result = service.validate(app, todos)
      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('REQUIRED_TODOS_INCOMPLETE')
        if (result.error.type === 'REQUIRED_TODOS_INCOMPLETE') {
          expect(result.error.incompleteTodoIds).toEqual(['todo-2'])
        }
      }
    })

    it('requiredでないTodoが未完了でも成功する', () => {
      const app = createApp()
      const todos = [
        createTodo(),
        createTodo({
          id: ApplicationTodoId.fromString('todo-2'),
          required: false,
          status: TodoStatus.pending(),
        }),
      ]
      const result = service.validate(app, todos)
      expect(Result.isOk(result)).toBe(true)
    })
  })
})
