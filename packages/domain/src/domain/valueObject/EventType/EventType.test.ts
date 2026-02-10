import { EventType } from './EventType'

describe('EventType', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(EventType.from('chat_started').value).toBe('chat_started')
      expect(EventType.from('application_submitted').value).toBe('application_submitted')
      expect(EventType.from('manual_fallback_triggered').value).toBe('manual_fallback_triggered')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => EventType.from('invalid')).toThrow('Invalid EventType: invalid')
    })
  })

  describe('ファクトリメソッド', () => {
    it('chatStarted()で作成できる', () => {
      expect(EventType.chatStarted().value).toBe('chat_started')
    })

    it('applicationSubmitted()で作成できる', () => {
      expect(EventType.applicationSubmitted().value).toBe('application_submitted')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(EventType.chatStarted().equals(EventType.chatStarted())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(EventType.chatStarted().equals(EventType.applicationSubmitted())).toBe(false)
    })
  })
})
