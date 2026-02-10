import { ChatSession } from './ChatSession'
import { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { ChatSessionType } from '../../valueObject/ChatSessionType/ChatSessionType'
import { ChatSessionStatus } from '../../valueObject/ChatSessionStatus/ChatSessionStatus'

const createSession = (overrides: Partial<Parameters<typeof ChatSession.create>[0]> = {}) =>
  ChatSession.create({
    id: ChatSessionId.fromString('cs-1'),
    applicationId: ApplicationId.fromString('app-1'),
    jobId: null,
    policyVersionId: null,
    type: ChatSessionType.application(),
    conductorId: null,
    bootstrapCompleted: false,
    status: ChatSessionStatus.active(),
    turnCount: 0,
    softCap: null,
    hardCap: null,
    softCappedAt: null,
    hardCappedAt: null,
    reviewFailStreak: 0,
    extractionFailStreak: 0,
    timeoutStreak: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('ChatSession', () => {
  describe('completeBootstrap', () => {
    it('ブートストラップを完了できる', () => {
      const session = createSession()
      const completed = session.completeBootstrap()
      expect(completed.bootstrapCompleted).toBe(true)
    })
  })

  describe('incrementTurnCount', () => {
    it('ターンカウントをインクリメントできる', () => {
      const session = createSession()
      const next = session.incrementTurnCount()
      expect(next.turnCount).toBe(1)
    })
  })

  describe('shouldFallback', () => {
    it('reviewFailStreak >= 3でフォールバック', () => {
      const session = createSession({ reviewFailStreak: 3 })
      expect(session.shouldFallback()).toBe(true)
    })

    it('extractionFailStreak >= 2でフォールバック', () => {
      const session = createSession({ extractionFailStreak: 2 })
      expect(session.shouldFallback()).toBe(true)
    })

    it('timeoutStreak >= 2でフォールバック', () => {
      const session = createSession({ timeoutStreak: 2 })
      expect(session.shouldFallback()).toBe(true)
    })

    it('閾値未満ではフォールバックしない', () => {
      const session = createSession({
        reviewFailStreak: 2,
        extractionFailStreak: 1,
        timeoutStreak: 1,
      })
      expect(session.shouldFallback()).toBe(false)
    })
  })

  describe('complete', () => {
    it('activeからcompletedに遷移できる', () => {
      const session = createSession()
      const completed = session.complete()
      expect(completed.status.isCompleted()).toBe(true)
    })

    it('completedからcompleteするとエラーになる', () => {
      const session = createSession({ status: ChatSessionStatus.completed() })
      expect(() => session.complete()).toThrow('Cannot complete session in status: completed')
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const s1 = createSession()
      const s2 = createSession()
      expect(s1.equals(s2)).toBe(true)
    })
  })
})
