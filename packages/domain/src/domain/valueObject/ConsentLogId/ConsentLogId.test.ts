import { ConsentLogId } from './ConsentLogId'

describe('ConsentLogId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ConsentLogId.fromString('cl-123')
      expect(id.value).toBe('cl-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ConsentLogId.fromString('')).toThrow('ConsentLogId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ConsentLogId.fromString('cl-123')
      const id2 = ConsentLogId.fromString('cl-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ConsentLogId.fromString('cl-123')
      const id2 = ConsentLogId.fromString('cl-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ConsentLogId.fromString('cl-123')
      expect(id.toString()).toBe('cl-123')
    })
  })
})
