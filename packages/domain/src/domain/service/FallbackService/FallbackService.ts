import type { ChatSession } from '../../entity/ChatSession/ChatSession'
import type { SubmissionTask } from '../../entity/SubmissionTask/SubmissionTask'

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
   * フォールバック対象のTask（未完了のもの）を取得する
   */
  getIncompleteTasks(tasks: SubmissionTask[]): SubmissionTask[] {
    return tasks.filter((task) => !task.status.isDone() && !task.status.isManualInput())
  }

  /**
   * 全Taskをmanual_inputに切り替える
   */
  triggerFallback(tasks: SubmissionTask[]): SubmissionTask[] {
    return tasks.map((task) => {
      if (!task.status.isDone() && !task.status.isManualInput()) {
        return task.fallbackToManualInput()
      }
      return task
    })
  }
}
