import { ApplicationId } from './ApplicationId'

describe('ApplicationId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ApplicationId.fromString('app-123')
      expect(id.value).toBe('app-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ApplicationId.fromString('')).toThrow('ApplicationId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ApplicationId.fromString('app-123')
      const id2 = ApplicationId.fromString('app-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ApplicationId.fromString('app-123')
      const id2 = ApplicationId.fromString('app-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ApplicationId.fromString('app-123')
      expect(id.toString()).toBe('app-123')
    })
  })
})
