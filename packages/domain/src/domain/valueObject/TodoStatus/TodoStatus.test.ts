import { TodoStatus } from './TodoStatus'

describe('TodoStatus', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(TodoStatus.from('pending').value).toBe('pending')
      expect(TodoStatus.from('awaiting_answer').value).toBe('awaiting_answer')
      expect(TodoStatus.from('validating').value).toBe('validating')
      expect(TodoStatus.from('needs_clarification').value).toBe('needs_clarification')
      expect(TodoStatus.from('done').value).toBe('done')
      expect(TodoStatus.from('manual_input').value).toBe('manual_input')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => TodoStatus.from('invalid')).toThrow('Invalid TodoStatus: invalid')
    })
  })

  describe('canTransitionTo', () => {
    it('pending -> awaiting_answer', () => {
      expect(TodoStatus.pending().canTransitionTo(TodoStatus.awaitingAnswer())).toBe(true)
    })

    it('awaiting_answer -> validating', () => {
      expect(TodoStatus.awaitingAnswer().canTransitionTo(TodoStatus.validating())).toBe(true)
    })

    it('validating -> done', () => {
      expect(TodoStatus.validating().canTransitionTo(TodoStatus.done())).toBe(true)
    })

    it('validating -> needs_clarification', () => {
      expect(TodoStatus.validating().canTransitionTo(TodoStatus.needsClarification())).toBe(true)
    })

    it('needs_clarification -> awaiting_answer', () => {
      expect(TodoStatus.needsClarification().canTransitionTo(TodoStatus.awaitingAnswer())).toBe(
        true
      )
    })

    it('manual_input -> done', () => {
      expect(TodoStatus.manualInput().canTransitionTo(TodoStatus.done())).toBe(true)
    })

    it('done -> pending（確認画面で修正）', () => {
      expect(TodoStatus.done().canTransitionTo(TodoStatus.pending())).toBe(true)
    })

    it('任意の状態 -> manual_input（フォールバック）', () => {
      expect(TodoStatus.pending().canTransitionTo(TodoStatus.manualInput())).toBe(true)
      expect(TodoStatus.awaitingAnswer().canTransitionTo(TodoStatus.manualInput())).toBe(true)
      expect(TodoStatus.validating().canTransitionTo(TodoStatus.manualInput())).toBe(true)
      expect(TodoStatus.needsClarification().canTransitionTo(TodoStatus.manualInput())).toBe(true)
      expect(TodoStatus.done().canTransitionTo(TodoStatus.manualInput())).toBe(true)
    })

    it('不正な遷移は拒否する', () => {
      expect(TodoStatus.pending().canTransitionTo(TodoStatus.done())).toBe(false)
      expect(TodoStatus.awaitingAnswer().canTransitionTo(TodoStatus.done())).toBe(false)
      expect(TodoStatus.done().canTransitionTo(TodoStatus.awaitingAnswer())).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(TodoStatus.pending().equals(TodoStatus.pending())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(TodoStatus.pending().equals(TodoStatus.done())).toBe(false)
    })
  })
})
