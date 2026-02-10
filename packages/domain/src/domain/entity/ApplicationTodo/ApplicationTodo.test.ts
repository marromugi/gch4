import { ApplicationTodo } from './ApplicationTodo'
import { ApplicationTodoId } from '../../valueObject/ApplicationTodoId/ApplicationTodoId'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { FieldFactDefinitionId } from '../../valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import { TodoStatus } from '../../valueObject/TodoStatus/TodoStatus'

const createTodo = (overrides: Partial<Parameters<typeof ApplicationTodo.create>[0]> = {}) =>
  ApplicationTodo.create({
    id: ApplicationTodoId.fromString('todo-1'),
    applicationId: ApplicationId.fromString('app-1'),
    fieldFactDefinitionId: FieldFactDefinitionId.fromString('ffd-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    fact: '非同期コミュニケーションで成果を出した実例',
    doneCriteria: '直近の具体事例が確認できること',
    required: true,
    status: TodoStatus.pending(),
    extractedValue: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('ApplicationTodo', () => {
  describe('transitionTo', () => {
    it('pending -> awaiting_answerに遷移できる', () => {
      const todo = createTodo()
      const next = todo.transitionTo(TodoStatus.awaitingAnswer())
      expect(next.status.isAwaitingAnswer()).toBe(true)
    })

    it('不正な遷移はエラーになる', () => {
      const todo = createTodo()
      expect(() => todo.transitionTo(TodoStatus.done())).toThrow(
        'Cannot transition todo from pending to done'
      )
    })
  })

  describe('markDone', () => {
    it('validatingからdoneに遷移し抽出値を設定できる', () => {
      const todo = createTodo({ status: TodoStatus.validating() })
      const done = todo.markDone('チームリーダーとして非同期で成果を出した')
      expect(done.status.isDone()).toBe(true)
      expect(done.extractedValue).toBe('チームリーダーとして非同期で成果を出した')
    })

    it('manual_inputからdoneに遷移できる', () => {
      const todo = createTodo({ status: TodoStatus.manualInput() })
      const done = todo.markDone('手入力値')
      expect(done.status.isDone()).toBe(true)
    })

    it('pendingからmarkDoneするとエラーになる', () => {
      const todo = createTodo()
      expect(() => todo.markDone('value')).toThrow('Cannot mark done from status: pending')
    })
  })

  describe('fallbackToManualInput', () => {
    it('任意の状態からmanual_inputに遷移できる', () => {
      const todo = createTodo({ status: TodoStatus.awaitingAnswer() })
      const fallback = todo.fallbackToManualInput()
      expect(fallback.status.isManualInput()).toBe(true)
    })
  })

  describe('resetToPending', () => {
    it('doneからpendingに戻せる', () => {
      const todo = createTodo({ status: TodoStatus.done(), extractedValue: 'some value' })
      const reset = todo.resetToPending()
      expect(reset.status.isPending()).toBe(true)
      expect(reset.extractedValue).toBeNull()
    })

    it('done以外からresetするとエラーになる', () => {
      const todo = createTodo()
      expect(() => todo.resetToPending()).toThrow('Cannot reset to pending from status: pending')
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const t1 = createTodo()
      const t2 = createTodo()
      expect(t1.equals(t2)).toBe(true)
    })
  })
})
