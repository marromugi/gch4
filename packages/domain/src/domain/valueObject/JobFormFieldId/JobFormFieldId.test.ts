import { JobFormFieldId } from './JobFormFieldId'

describe('JobFormFieldId', () => {
  describe('fromString', () => {
    it('有効な文字列からJobFormFieldIdを作成できる', () => {
      const id = JobFormFieldId.fromString('field-123')
      expect(id.value).toBe('field-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => JobFormFieldId.fromString('')).toThrow('JobFormFieldId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = JobFormFieldId.fromString('field-123')
      const id2 = JobFormFieldId.fromString('field-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = JobFormFieldId.fromString('field-123')
      const id2 = JobFormFieldId.fromString('field-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = JobFormFieldId.fromString('field-123')
      expect(id.toString()).toBe('field-123')
    })
  })
})
