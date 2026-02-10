import type { ChatSession } from '../../entity/ChatSession/ChatSession'
import type { ApplicationTodo } from '../../entity/ApplicationTodo/ApplicationTodo'

/**
 * フォールバック条件判定サービス
 *
 * フォールバック条件（いずれかを満たした場合）:
 * - レビュー失敗が3回連続
 * - 抽出失敗が2回連続
 * - タイムアウトが2回連続
 */
export class FallbackService {
  /**
   * フォールバック条件に達しているか判定する
   */
  shouldTriggerFallback(session: ChatSession): boolean {
    return session.shouldFallback()
  }

  /**
   * フォールバック対象のTodo（未完了のもの）を取得する
   */
  getIncompleteTodos(todos: ApplicationTodo[]): ApplicationTodo[] {
    return todos.filter((todo) => !todo.status.isDone() && !todo.status.isManualInput())
  }

  /**
   * 全Todoをmanual_inputに切り替える
   */
  triggerFallback(todos: ApplicationTodo[]): ApplicationTodo[] {
    return todos.map((todo) => {
      if (!todo.status.isDone() && !todo.status.isManualInput()) {
        return todo.fallbackToManualInput()
      }
      return todo
    })
  }
}
