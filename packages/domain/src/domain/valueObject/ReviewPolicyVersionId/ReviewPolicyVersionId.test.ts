import { ReviewPolicyVersionId } from './ReviewPolicyVersionId'

describe('ReviewPolicyVersionId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ReviewPolicyVersionId.fromString('rpv-123')
      expect(id.value).toBe('rpv-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ReviewPolicyVersionId.fromString('')).toThrow(
        'ReviewPolicyVersionId cannot be empty'
      )
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ReviewPolicyVersionId.fromString('rpv-123')
      const id2 = ReviewPolicyVersionId.fromString('rpv-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ReviewPolicyVersionId.fromString('rpv-123')
      const id2 = ReviewPolicyVersionId.fromString('rpv-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ReviewPolicyVersionId.fromString('rpv-123')
      expect(id.toString()).toBe('rpv-123')
    })
  })
})
