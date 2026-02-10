import { ReviewPolicySignalId } from './ReviewPolicySignalId'

describe('ReviewPolicySignalId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ReviewPolicySignalId.fromString('rps-123')
      expect(id.value).toBe('rps-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ReviewPolicySignalId.fromString('')).toThrow(
        'ReviewPolicySignalId cannot be empty'
      )
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ReviewPolicySignalId.fromString('rps-123')
      const id2 = ReviewPolicySignalId.fromString('rps-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ReviewPolicySignalId.fromString('rps-123')
      const id2 = ReviewPolicySignalId.fromString('rps-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ReviewPolicySignalId.fromString('rps-123')
      expect(id.toString()).toBe('rps-123')
    })
  })
})
