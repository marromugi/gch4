import { ApplicationStatus } from './ApplicationStatus'

describe('ApplicationStatus', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ApplicationStatus.from('new').value).toBe('new')
      expect(ApplicationStatus.from('scheduling').value).toBe('scheduling')
      expect(ApplicationStatus.from('interviewed').value).toBe('interviewed')
      expect(ApplicationStatus.from('closed').value).toBe('closed')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ApplicationStatus.from('invalid')).toThrow('Invalid ApplicationStatus: invalid')
    })
  })

  describe('canTransitionTo', () => {
    it('newからschedulingに遷移できる', () => {
      expect(ApplicationStatus.new().canTransitionTo(ApplicationStatus.scheduling())).toBe(true)
    })

    it('newからclosedに遷移できる', () => {
      expect(ApplicationStatus.new().canTransitionTo(ApplicationStatus.closed())).toBe(true)
    })

    it('schedulingからinterviewedに遷移できる', () => {
      expect(ApplicationStatus.scheduling().canTransitionTo(ApplicationStatus.interviewed())).toBe(
        true
      )
    })

    it('interviewedからclosedに遷移できる', () => {
      expect(ApplicationStatus.interviewed().canTransitionTo(ApplicationStatus.closed())).toBe(true)
    })

    it('closedからは遷移できない', () => {
      expect(ApplicationStatus.closed().canTransitionTo(ApplicationStatus.new())).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ApplicationStatus.new().equals(ApplicationStatus.new())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ApplicationStatus.new().equals(ApplicationStatus.closed())).toBe(false)
    })
  })
})
