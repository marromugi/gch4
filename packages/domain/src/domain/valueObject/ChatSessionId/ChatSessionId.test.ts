import { ChatSessionId } from './ChatSessionId'

describe('ChatSessionId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ChatSessionId.fromString('cs-123')
      expect(id.value).toBe('cs-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ChatSessionId.fromString('')).toThrow('ChatSessionId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ChatSessionId.fromString('cs-123')
      const id2 = ChatSessionId.fromString('cs-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ChatSessionId.fromString('cs-123')
      const id2 = ChatSessionId.fromString('cs-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ChatSessionId.fromString('cs-123')
      expect(id.toString()).toBe('cs-123')
    })
  })
})
