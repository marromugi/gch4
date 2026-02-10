import { ExtractedFieldId } from './ExtractedFieldId'

describe('ExtractedFieldId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ExtractedFieldId.fromString('ef-123')
      expect(id.value).toBe('ef-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ExtractedFieldId.fromString('')).toThrow('ExtractedFieldId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ExtractedFieldId.fromString('ef-123')
      const id2 = ExtractedFieldId.fromString('ef-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ExtractedFieldId.fromString('ef-123')
      const id2 = ExtractedFieldId.fromString('ef-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ExtractedFieldId.fromString('ef-123')
      expect(id.toString()).toBe('ef-123')
    })
  })
})
