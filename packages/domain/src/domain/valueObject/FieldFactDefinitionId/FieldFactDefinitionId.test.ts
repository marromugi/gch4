import { FieldFactDefinitionId } from './FieldFactDefinitionId'

describe('FieldFactDefinitionId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = FieldFactDefinitionId.fromString('ffd-123')
      expect(id.value).toBe('ffd-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => FieldFactDefinitionId.fromString('')).toThrow(
        'FieldFactDefinitionId cannot be empty'
      )
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = FieldFactDefinitionId.fromString('ffd-123')
      const id2 = FieldFactDefinitionId.fromString('ffd-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = FieldFactDefinitionId.fromString('ffd-123')
      const id2 = FieldFactDefinitionId.fromString('ffd-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = FieldFactDefinitionId.fromString('ffd-123')
      expect(id.toString()).toBe('ffd-123')
    })
  })
})
