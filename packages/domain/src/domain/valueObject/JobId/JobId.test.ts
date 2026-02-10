import { JobId } from './JobId'

describe('JobId', () => {
  describe('fromString', () => {
    it('有効な文字列からJobIdを作成できる', () => {
      const id = JobId.fromString('job-123')
      expect(id.value).toBe('job-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => JobId.fromString('')).toThrow('JobId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値のJobIdはequalである', () => {
      const id1 = JobId.fromString('job-123')
      const id2 = JobId.fromString('job-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値のJobIdはequalでない', () => {
      const id1 = JobId.fromString('job-123')
      const id2 = JobId.fromString('job-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = JobId.fromString('job-123')
      expect(id.toString()).toBe('job-123')
    })
  })
})
