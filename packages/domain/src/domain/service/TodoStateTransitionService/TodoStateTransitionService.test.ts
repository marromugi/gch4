import { TodoStateTransitionService } from './TodoStateTransitionService'
import { ApplicationTodo } from '../../entity/ApplicationTodo/ApplicationTodo'
import { ApplicationTodoId } from '../../valueObject/ApplicationTodoId/ApplicationTodoId'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { FieldFactDefinitionId } from '../../valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import { TodoStatus } from '../../valueObject/TodoStatus/TodoStatus'
import { Result } from '../../shared/Result/Result'

const service = new TodoStateTransitionService()

const createTodo = (status: TodoStatus) =>
  ApplicationTodo.create({
    id: ApplicationTodoId.fromString('todo-1'),
    applicationId: ApplicationId.fromString('app-1'),
    fieldFactDefinitionId: FieldFactDefinitionId.fromString('ffd-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    fact: 'テストfact',
    doneCriteria: 'テスト基準',
    required: true,
    status,
    extractedValue: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

describe('TodoStateTransitionService', () => {
  describe('markQuestionSent', () => {
    it('pending -> awaiting_answerに遷移できる', () => {
      const todo = createTodo(TodoStatus.pending())
      const result = service.markQuestionSent(todo)
      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isAwaitingAnswer()).toBe(true)
      }
    })

    it('done -> awaiting_answerは失敗する', () => {
      const todo = createTodo(TodoStatus.done())
      const result = service.markQuestionSent(todo)
      expect(Result.isErr(result)).toBe(true)
    })
  })

  describe('markAnswerReceived', () => {
    it('awaiting_answer -> validatingに遷移できる', () => {
      const todo = createTodo(TodoStatus.awaitingAnswer())
      const result = service.markAnswerReceived(todo)
      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isValidating()).toBe(true)
      }
    })
  })

  describe('markExtractionSucceeded', () => {
    it('validating -> doneに遷移し抽出値を設定する', () => {
      const todo = createTodo(TodoStatus.validating())
      const result = service.markExtractionSucceeded(todo, '抽出された値')
      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isDone()).toBe(true)
        expect(result.value.extractedValue).toBe('抽出された値')
      }
    })
  })

  describe('markNeedsClarification', () => {
    it('validating -> needs_clarificationに遷移できる', () => {
      const todo = createTodo(TodoStatus.validating())
      const result = service.markNeedsClarification(todo)
      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isNeedsClarification()).toBe(true)
      }
    })
  })

  describe('markFallback', () => {
    it('任意の状態からmanual_inputに遷移できる', () => {
      const todo = createTodo(TodoStatus.awaitingAnswer())
      const result = service.markFallback(todo)
      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isManualInput()).toBe(true)
      }
    })
  })

  describe('markManualInputCompleted', () => {
    it('manual_input -> doneに遷移できる', () => {
      const todo = createTodo(TodoStatus.manualInput())
      const result = service.markManualInputCompleted(todo, '手入力値')
      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isDone()).toBe(true)
        expect(result.value.extractedValue).toBe('手入力値')
      }
    })
  })

  describe('resetForCorrection', () => {
    it('done -> pendingに遷移できる', () => {
      const todo = createTodo(TodoStatus.done())
      const result = service.resetForCorrection(todo)
      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isPending()).toBe(true)
        expect(result.value.extractedValue).toBeNull()
      }
    })

    it('pending -> pendingは失敗する', () => {
      const todo = createTodo(TodoStatus.pending())
      const result = service.resetForCorrection(todo)
      expect(Result.isErr(result)).toBe(true)
    })
  })
})
