import { InterviewFeedbackId } from './InterviewFeedbackId'

describe('InterviewFeedbackId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = InterviewFeedbackId.fromString('if-123')
      expect(id.value).toBe('if-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => InterviewFeedbackId.fromString('')).toThrow(
        'InterviewFeedbackId cannot be empty'
      )
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = InterviewFeedbackId.fromString('if-123')
      const id2 = InterviewFeedbackId.fromString('if-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = InterviewFeedbackId.fromString('if-123')
      const id2 = InterviewFeedbackId.fromString('if-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = InterviewFeedbackId.fromString('if-123')
      expect(id.toString()).toBe('if-123')
    })
  })
})
