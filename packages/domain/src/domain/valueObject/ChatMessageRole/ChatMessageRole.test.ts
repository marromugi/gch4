import { ChatMessageRole } from './ChatMessageRole'

describe('ChatMessageRole', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ChatMessageRole.from('user').value).toBe('user')
      expect(ChatMessageRole.from('assistant').value).toBe('assistant')
      expect(ChatMessageRole.from('system').value).toBe('system')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ChatMessageRole.from('invalid')).toThrow('Invalid ChatMessageRole: invalid')
    })
  })

  describe('ファクトリメソッド', () => {
    it('user()で作成できる', () => {
      expect(ChatMessageRole.user().isUser()).toBe(true)
    })

    it('assistant()で作成できる', () => {
      expect(ChatMessageRole.assistant().isAssistant()).toBe(true)
    })

    it('system()で作成できる', () => {
      expect(ChatMessageRole.system().isSystem()).toBe(true)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ChatMessageRole.user().equals(ChatMessageRole.user())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ChatMessageRole.user().equals(ChatMessageRole.assistant())).toBe(false)
    })
  })
})
