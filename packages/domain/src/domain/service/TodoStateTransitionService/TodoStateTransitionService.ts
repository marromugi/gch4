import type { Result } from '../../shared/Result/Result'
import { Result as R } from '../../shared/Result/Result'
import type { ApplicationTodo } from '../../entity/ApplicationTodo/ApplicationTodo'
import { TodoStatus } from '../../valueObject/TodoStatus/TodoStatus'

export type TransitionError = {
  type: 'INVALID_TRANSITION'
  from: string
  to: string
}

/**
 * Todo状態遷移管理サービス
 */
export class TodoStateTransitionService {
  /**
   * 質問送信時: pending -> awaiting_answer
   */
  markQuestionSent(todo: ApplicationTodo): Result<ApplicationTodo, TransitionError> {
    return this.transition(todo, TodoStatus.awaitingAnswer())
  }

  /**
   * 回答受信時: awaiting_answer -> validating
   */
  markAnswerReceived(todo: ApplicationTodo): Result<ApplicationTodo, TransitionError> {
    return this.transition(todo, TodoStatus.validating())
  }

  /**
   * 抽出成功時: validating -> done
   */
  markExtractionSucceeded(
    todo: ApplicationTodo,
    extractedValue: string
  ): Result<ApplicationTodo, TransitionError> {
    if (!todo.status.isValidating()) {
      return R.err({
        type: 'INVALID_TRANSITION',
        from: todo.status.value,
        to: 'done',
      })
    }
    return R.ok(todo.markDone(extractedValue))
  }

  /**
   * 追加質問必要時: validating -> needs_clarification
   */
  markNeedsClarification(todo: ApplicationTodo): Result<ApplicationTodo, TransitionError> {
    return this.transition(todo, TodoStatus.needsClarification())
  }

  /**
   * 追加質問送信時: needs_clarification -> awaiting_answer
   */
  markClarificationSent(todo: ApplicationTodo): Result<ApplicationTodo, TransitionError> {
    return this.transition(todo, TodoStatus.awaitingAnswer())
  }

  /**
   * フォールバック時: 任意 -> manual_input
   */
  markFallback(todo: ApplicationTodo): Result<ApplicationTodo, TransitionError> {
    return R.ok(todo.fallbackToManualInput())
  }

  /**
   * 手入力完了時: manual_input -> done
   */
  markManualInputCompleted(
    todo: ApplicationTodo,
    value: string
  ): Result<ApplicationTodo, TransitionError> {
    if (!todo.status.isManualInput()) {
      return R.err({
        type: 'INVALID_TRANSITION',
        from: todo.status.value,
        to: 'done',
      })
    }
    return R.ok(todo.markDone(value))
  }

  /**
   * 確認画面での修正時: done -> pending
   */
  resetForCorrection(todo: ApplicationTodo): Result<ApplicationTodo, TransitionError> {
    if (!todo.status.isDone()) {
      return R.err({
        type: 'INVALID_TRANSITION',
        from: todo.status.value,
        to: 'pending',
      })
    }
    return R.ok(todo.resetToPending())
  }

  private transition(
    todo: ApplicationTodo,
    nextStatus: TodoStatus
  ): Result<ApplicationTodo, TransitionError> {
    if (!todo.status.canTransitionTo(nextStatus)) {
      return R.err({
        type: 'INVALID_TRANSITION',
        from: todo.status.value,
        to: nextStatus.value,
      })
    }
    return R.ok(todo.transitionTo(nextStatus))
  }
}
