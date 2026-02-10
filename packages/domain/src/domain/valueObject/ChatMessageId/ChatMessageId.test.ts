import { ChatMessageId } from './ChatMessageId'

describe('ChatMessageId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ChatMessageId.fromString('cm-123')
      expect(id.value).toBe('cm-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ChatMessageId.fromString('')).toThrow('ChatMessageId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ChatMessageId.fromString('cm-123')
      const id2 = ChatMessageId.fromString('cm-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ChatMessageId.fromString('cm-123')
      const id2 = ChatMessageId.fromString('cm-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ChatMessageId.fromString('cm-123')
      expect(id.toString()).toBe('cm-123')
    })
  })
})
