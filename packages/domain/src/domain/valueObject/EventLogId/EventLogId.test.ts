import { EventLogId } from './EventLogId'

describe('EventLogId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = EventLogId.fromString('el-123')
      expect(id.value).toBe('el-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => EventLogId.fromString('')).toThrow('EventLogId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = EventLogId.fromString('el-123')
      const id2 = EventLogId.fromString('el-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = EventLogId.fromString('el-123')
      const id2 = EventLogId.fromString('el-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = EventLogId.fromString('el-123')
      expect(id.toString()).toBe('el-123')
    })
  })
})
