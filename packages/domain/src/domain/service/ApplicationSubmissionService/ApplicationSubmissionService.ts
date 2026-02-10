import type { Result } from '../../shared/Result/Result'
import { Result as R } from '../../shared/Result/Result'
import type { Application } from '../../entity/Application/Application'
import type { ApplicationTodo } from '../../entity/ApplicationTodo/ApplicationTodo'

export type SubmissionError =
  | { type: 'EXTRACTION_NOT_REVIEWED' }
  | { type: 'CONSENT_NOT_CHECKED' }
  | { type: 'REQUIRED_TODOS_INCOMPLETE'; incompleteTodoIds: string[] }

/**
 * 応募確定時のビジネスルール検証サービス
 *
 * 不変条件:
 * - 抽出結果の確認が完了していること
 * - 同意チェックが完了していること
 * - requiredなTodoが全てdoneであること
 */
export class ApplicationSubmissionService {
  /**
   * 応募確定の前提条件を検証する
   */
  validate(application: Application, todos: ApplicationTodo[]): Result<void, SubmissionError> {
    if (!application.extractionReviewedAt) {
      return R.err({ type: 'EXTRACTION_NOT_REVIEWED' })
    }

    if (!application.consentCheckedAt) {
      return R.err({ type: 'CONSENT_NOT_CHECKED' })
    }

    const incompleteTodos = todos.filter((todo) => todo.required && !todo.status.isDone())
    if (incompleteTodos.length > 0) {
      return R.err({
        type: 'REQUIRED_TODOS_INCOMPLETE',
        incompleteTodoIds: incompleteTodos.map((t) => t.id.value),
      })
    }

    return R.ok(undefined)
  }
}
