import { JobStatus } from './JobStatus'

describe('JobStatus', () => {
  describe('from', () => {
    it('有効な値からJobStatusを作成できる', () => {
      expect(JobStatus.from('draft').value).toBe('draft')
      expect(JobStatus.from('open').value).toBe('open')
      expect(JobStatus.from('closed').value).toBe('closed')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => JobStatus.from('invalid')).toThrow('Invalid JobStatus: invalid')
    })
  })

  describe('ファクトリメソッド', () => {
    it('draft()でdraftステータスを作成できる', () => {
      expect(JobStatus.draft().isDraft()).toBe(true)
    })

    it('open()でopenステータスを作成できる', () => {
      expect(JobStatus.open().isOpen()).toBe(true)
    })

    it('closed()でclosedステータスを作成できる', () => {
      expect(JobStatus.closed().isClosed()).toBe(true)
    })
  })

  describe('canTransitionTo', () => {
    it('draftからopenに遷移できる', () => {
      expect(JobStatus.draft().canTransitionTo(JobStatus.open())).toBe(true)
    })

    it('draftからclosedには遷移できない', () => {
      expect(JobStatus.draft().canTransitionTo(JobStatus.closed())).toBe(false)
    })

    it('openからclosedに遷移できる', () => {
      expect(JobStatus.open().canTransitionTo(JobStatus.closed())).toBe(true)
    })

    it('closedからは遷移できない', () => {
      expect(JobStatus.closed().canTransitionTo(JobStatus.draft())).toBe(false)
      expect(JobStatus.closed().canTransitionTo(JobStatus.open())).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(JobStatus.draft().equals(JobStatus.draft())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(JobStatus.draft().equals(JobStatus.open())).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      expect(JobStatus.draft().toString()).toBe('draft')
    })
  })
})
