import { ChatSessionStatus } from './ChatSessionStatus'

describe('ChatSessionStatus', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ChatSessionStatus.from('active').value).toBe('active')
      expect(ChatSessionStatus.from('completed').value).toBe('completed')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ChatSessionStatus.from('invalid')).toThrow('Invalid ChatSessionStatus: invalid')
    })
  })

  describe('canTransitionTo', () => {
    it('activeからcompletedに遷移できる', () => {
      expect(ChatSessionStatus.active().canTransitionTo(ChatSessionStatus.completed())).toBe(true)
    })

    it('completedからは遷移できない', () => {
      expect(ChatSessionStatus.completed().canTransitionTo(ChatSessionStatus.active())).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ChatSessionStatus.active().equals(ChatSessionStatus.active())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ChatSessionStatus.active().equals(ChatSessionStatus.completed())).toBe(false)
    })
  })
})
