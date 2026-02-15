import { ChatSessionType } from './ChatSessionType'

describe('ChatSessionType', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ChatSessionType.from('form_response').value).toBe('form_response')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ChatSessionType.from('invalid')).toThrow('Invalid ChatSessionType: invalid')
    })
  })

  describe('ファクトリメソッド', () => {
    it('formResponse()で作成できる', () => {
      expect(ChatSessionType.formResponse().isFormResponse()).toBe(true)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ChatSessionType.formResponse().equals(ChatSessionType.formResponse())).toBe(true)
    })
  })
})
