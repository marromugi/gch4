import { JobSchemaVersionId } from './JobSchemaVersionId'

describe('JobSchemaVersionId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = JobSchemaVersionId.fromString('sv-123')
      expect(id.value).toBe('sv-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => JobSchemaVersionId.fromString('')).toThrow('JobSchemaVersionId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = JobSchemaVersionId.fromString('sv-123')
      const id2 = JobSchemaVersionId.fromString('sv-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = JobSchemaVersionId.fromString('sv-123')
      const id2 = JobSchemaVersionId.fromString('sv-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = JobSchemaVersionId.fromString('sv-123')
      expect(id.toString()).toBe('sv-123')
    })
  })
})
