import { JobSchemaVersionStatus } from './JobSchemaVersionStatus'

describe('JobSchemaVersionStatus', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(JobSchemaVersionStatus.from('draft').value).toBe('draft')
      expect(JobSchemaVersionStatus.from('approved').value).toBe('approved')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => JobSchemaVersionStatus.from('invalid')).toThrow(
        'Invalid JobSchemaVersionStatus: invalid'
      )
    })
  })

  describe('canTransitionTo', () => {
    it('draftからapprovedに遷移できる', () => {
      expect(
        JobSchemaVersionStatus.draft().canTransitionTo(JobSchemaVersionStatus.approved())
      ).toBe(true)
    })

    it('approvedからは遷移できない', () => {
      expect(
        JobSchemaVersionStatus.approved().canTransitionTo(JobSchemaVersionStatus.draft())
      ).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(JobSchemaVersionStatus.draft().equals(JobSchemaVersionStatus.draft())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(JobSchemaVersionStatus.draft().equals(JobSchemaVersionStatus.approved())).toBe(false)
    })
  })
})
