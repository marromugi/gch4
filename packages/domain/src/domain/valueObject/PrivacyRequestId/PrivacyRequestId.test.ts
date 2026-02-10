import { PrivacyRequestId } from './PrivacyRequestId'

describe('PrivacyRequestId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = PrivacyRequestId.fromString('pr-123')
      expect(id.value).toBe('pr-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => PrivacyRequestId.fromString('')).toThrow('PrivacyRequestId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = PrivacyRequestId.fromString('pr-123')
      const id2 = PrivacyRequestId.fromString('pr-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = PrivacyRequestId.fromString('pr-123')
      const id2 = PrivacyRequestId.fromString('pr-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = PrivacyRequestId.fromString('pr-123')
      expect(id.toString()).toBe('pr-123')
    })
  })
})
