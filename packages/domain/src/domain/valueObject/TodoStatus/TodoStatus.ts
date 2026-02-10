const TODO_STATUSES = [
  'pending',
  'awaiting_answer',
  'validating',
  'needs_clarification',
  'done',
  'manual_input',
] as const
export type TodoStatusValue = (typeof TODO_STATUSES)[number]

/**
 * ApplicationTodoのステータス
 *
 * 状態遷移:
 * pending -> awaiting_answer（質問送信時）
 * awaiting_answer -> validating（回答受信時）
 * validating -> done（抽出成功、done_criteria充足時）
 * validating -> needs_clarification（回答が曖昧な場合）
 * needs_clarification -> awaiting_answer（追加質問送信時）
 * 任意の状態 -> manual_input（フォールバック閾値到達時）
 * manual_input -> done（手入力完了時）
 * done -> pending（ユーザーが確認画面で修正した場合）
 */
export class TodoStatus {
  private constructor(private readonly _value: TodoStatusValue) {}

  get value(): TodoStatusValue {
    return this._value
  }

  static from(value: string): TodoStatus {
    if (!TODO_STATUSES.includes(value as TodoStatusValue)) {
      throw new Error(`Invalid TodoStatus: ${value}`)
    }
    return new TodoStatus(value as TodoStatusValue)
  }

  static pending(): TodoStatus {
    return new TodoStatus('pending')
  }

  static awaitingAnswer(): TodoStatus {
    return new TodoStatus('awaiting_answer')
  }

  static validating(): TodoStatus {
    return new TodoStatus('validating')
  }

  static needsClarification(): TodoStatus {
    return new TodoStatus('needs_clarification')
  }

  static done(): TodoStatus {
    return new TodoStatus('done')
  }

  static manualInput(): TodoStatus {
    return new TodoStatus('manual_input')
  }

  isPending(): boolean {
    return this._value === 'pending'
  }

  isAwaitingAnswer(): boolean {
    return this._value === 'awaiting_answer'
  }

  isValidating(): boolean {
    return this._value === 'validating'
  }

  isNeedsClarification(): boolean {
    return this._value === 'needs_clarification'
  }

  isDone(): boolean {
    return this._value === 'done'
  }

  isManualInput(): boolean {
    return this._value === 'manual_input'
  }

  canTransitionTo(next: TodoStatus): boolean {
    // 任意の状態 -> manual_input（フォールバック）
    if (next._value === 'manual_input') {
      return true
    }

    switch (this._value) {
      case 'pending':
        return next._value === 'awaiting_answer'
      case 'awaiting_answer':
        return next._value === 'validating'
      case 'validating':
        return next._value === 'done' || next._value === 'needs_clarification'
      case 'needs_clarification':
        return next._value === 'awaiting_answer'
      case 'manual_input':
        return next._value === 'done'
      case 'done':
        return next._value === 'pending'
    }
  }

  equals(other: TodoStatus): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
