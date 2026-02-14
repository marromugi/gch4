import { FallbackService } from './FallbackService'
import { ChatSession } from '../../entity/ChatSession/ChatSession'
import { ApplicationTodo } from '../../entity/ApplicationTodo/ApplicationTodo'
import { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { ApplicationTodoId } from '../../valueObject/ApplicationTodoId/ApplicationTodoId'
import { FieldFactDefinitionId } from '../../valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import { ChatSessionType } from '../../valueObject/ChatSessionType/ChatSessionType'
import { ChatSessionStatus } from '../../valueObject/ChatSessionStatus/ChatSessionStatus'
import { TodoStatus } from '../../valueObject/TodoStatus/TodoStatus'
import { AgentType } from '../../valueObject/AgentType/AgentType'

const service = new FallbackService()

const createSession = (overrides: Partial<Parameters<typeof ChatSession.create>[0]> = {}) =>
  ChatSession.create({
    id: ChatSessionId.fromString('cs-1'),
    applicationId: ApplicationId.fromString('app-1'),
    jobId: null,
    policyVersionId: null,
    type: ChatSessionType.application(),
    conductorId: null,
    bootstrapCompleted: true,
    status: ChatSessionStatus.active(),
    turnCount: 5,
    softCap: null,
    hardCap: null,
    softCappedAt: null,
    hardCappedAt: null,
    reviewFailStreak: 0,
    extractionFailStreak: 0,
    timeoutStreak: 0,
    currentAgent: AgentType.greeter(),
    plan: null,
    planSchemaVersion: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

const createTodo = (id: string, status: TodoStatus) =>
  ApplicationTodo.create({
    id: ApplicationTodoId.fromString(id),
    applicationId: ApplicationId.fromString('app-1'),
    fieldFactDefinitionId: FieldFactDefinitionId.fromString('ffd-1'),
    jobFormFieldId: JobFormFieldId.fromString('jff-1'),
    fact: 'テストfact',
    doneCriteria: 'テスト基準',
    required: true,
    status,
    extractedValue: status.isDone() ? '値' : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

describe('FallbackService', () => {
  describe('shouldTriggerFallback', () => {
    it('reviewFailStreak >= 3でtrueを返す', () => {
      const session = createSession({ reviewFailStreak: 3 })
      expect(service.shouldTriggerFallback(session)).toBe(true)
    })

    it('extractionFailStreak >= 2でtrueを返す', () => {
      const session = createSession({ extractionFailStreak: 2 })
      expect(service.shouldTriggerFallback(session)).toBe(true)
    })

    it('timeoutStreak >= 2でtrueを返す', () => {
      const session = createSession({ timeoutStreak: 2 })
      expect(service.shouldTriggerFallback(session)).toBe(true)
    })

    it('閾値未満ではfalseを返す', () => {
      const session = createSession()
      expect(service.shouldTriggerFallback(session)).toBe(false)
    })
  })

  describe('getIncompleteTodos', () => {
    it('未完了のTodoを返す', () => {
      const todos = [
        createTodo('todo-1', TodoStatus.done()),
        createTodo('todo-2', TodoStatus.pending()),
        createTodo('todo-3', TodoStatus.awaitingAnswer()),
      ]
      const incomplete = service.getIncompleteTodos(todos)
      expect(incomplete).toHaveLength(2)
    })

    it('manual_inputのTodoは除外する', () => {
      const todos = [
        createTodo('todo-1', TodoStatus.manualInput()),
        createTodo('todo-2', TodoStatus.pending()),
      ]
      const incomplete = service.getIncompleteTodos(todos)
      expect(incomplete).toHaveLength(1)
    })
  })

  describe('triggerFallback', () => {
    it('未完了のTodoをmanual_inputに切り替える', () => {
      const todos = [
        createTodo('todo-1', TodoStatus.done()),
        createTodo('todo-2', TodoStatus.pending()),
        createTodo('todo-3', TodoStatus.awaitingAnswer()),
      ]
      const result = service.triggerFallback(todos)
      expect(result[0].status.isDone()).toBe(true)
      expect(result[1].status.isManualInput()).toBe(true)
      expect(result[2].status.isManualInput()).toBe(true)
    })
  })
})
