import { ChatSessionType } from './ChatSessionType'

describe('ChatSessionType', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ChatSessionType.from('application').value).toBe('application')
      expect(ChatSessionType.from('interview_feedback').value).toBe('interview_feedback')
      expect(ChatSessionType.from('policy_creation').value).toBe('policy_creation')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ChatSessionType.from('invalid')).toThrow('Invalid ChatSessionType: invalid')
    })
  })

  describe('ファクトリメソッド', () => {
    it('application()で作成できる', () => {
      expect(ChatSessionType.application().isApplication()).toBe(true)
    })

    it('interviewFeedback()で作成できる', () => {
      expect(ChatSessionType.interviewFeedback().isInterviewFeedback()).toBe(true)
    })

    it('policyCreation()で作成できる', () => {
      expect(ChatSessionType.policyCreation().isPolicyCreation()).toBe(true)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ChatSessionType.application().equals(ChatSessionType.application())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ChatSessionType.application().equals(ChatSessionType.interviewFeedback())).toBe(false)
    })
  })
})
