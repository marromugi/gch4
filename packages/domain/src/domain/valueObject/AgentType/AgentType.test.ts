import { describe, it, expect } from 'vitest'
import { AgentType } from './AgentType'

describe('AgentType', () => {
  describe('from', () => {
    it('有効な文字列からAgentTypeを作成できる', () => {
      const agentType = AgentType.from('greeter')
      expect(agentType.value).toBe('greeter')
    })

    it.each(['greeter', 'architect', 'interviewer', 'reviewer'])('%s を作成できる', (value) => {
      const agentType = AgentType.from(value)
      expect(agentType.value).toBe(value)
    })

    it('無効な文字列でエラーを投げる', () => {
      expect(() => AgentType.from('invalid')).toThrow('Invalid AgentType: invalid')
    })

    it('空文字でエラーを投げる', () => {
      expect(() => AgentType.from('')).toThrow('Invalid AgentType: ')
    })
  })

  describe('ファクトリメソッド', () => {
    it('greeter() は greeter を返す', () => {
      expect(AgentType.greeter().value).toBe('greeter')
    })

    it('architect() は architect を返す', () => {
      expect(AgentType.architect().value).toBe('architect')
    })

    it('interviewer() は interviewer を返す', () => {
      expect(AgentType.interviewer().value).toBe('interviewer')
    })

    it('reviewer() は reviewer を返す', () => {
      expect(AgentType.reviewer().value).toBe('reviewer')
    })
  })

  describe('isXxx メソッド', () => {
    it('isGreeter() は greeter の場合 true', () => {
      expect(AgentType.greeter().isGreeter()).toBe(true)
      expect(AgentType.architect().isGreeter()).toBe(false)
    })

    it('isArchitect() は architect の場合 true', () => {
      expect(AgentType.architect().isArchitect()).toBe(true)
      expect(AgentType.greeter().isArchitect()).toBe(false)
    })

    it('isInterviewer() は interviewer の場合 true', () => {
      expect(AgentType.interviewer().isInterviewer()).toBe(true)
      expect(AgentType.greeter().isInterviewer()).toBe(false)
    })

    it('isReviewer() は reviewer の場合 true', () => {
      expect(AgentType.reviewer().isReviewer()).toBe(true)
      expect(AgentType.greeter().isReviewer()).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じ値は equal', () => {
      const a = AgentType.greeter()
      const b = AgentType.greeter()
      expect(a.equals(b)).toBe(true)
    })

    it('異なる値は not equal', () => {
      const a = AgentType.greeter()
      const b = AgentType.architect()
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      expect(AgentType.greeter().toString()).toBe('greeter')
      expect(AgentType.reviewer().toString()).toBe('reviewer')
    })
  })
})
