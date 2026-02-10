import { ApplicationTodoId } from './ApplicationTodoId'

describe('ApplicationTodoId', () => {
  describe('fromString', () => {
    it('有効な文字列から作成できる', () => {
      const id = ApplicationTodoId.fromString('todo-123')
      expect(id.value).toBe('todo-123')
    })

    it('空文字列でエラーを投げる', () => {
      expect(() => ApplicationTodoId.fromString('')).toThrow('ApplicationTodoId cannot be empty')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      const id1 = ApplicationTodoId.fromString('todo-123')
      const id2 = ApplicationTodoId.fromString('todo-123')
      expect(id1.equals(id2)).toBe(true)
    })

    it('異なる値はequalでない', () => {
      const id1 = ApplicationTodoId.fromString('todo-123')
      const id2 = ApplicationTodoId.fromString('todo-456')
      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const id = ApplicationTodoId.fromString('todo-123')
      expect(id.toString()).toBe('todo-123')
    })
  })
})
