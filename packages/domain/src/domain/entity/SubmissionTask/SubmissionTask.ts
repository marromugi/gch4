import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { SubmissionTaskId } from '../../valueObject/SubmissionTaskId/SubmissionTaskId'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import type { FieldCompletionCriteriaId } from '../../valueObject/FieldCompletionCriteriaId/FieldCompletionCriteriaId'
import type { FormFieldId } from '../../valueObject/FormFieldId/FormFieldId'
import { TodoStatus } from '../../valueObject/TodoStatus/TodoStatus'

export interface SubmissionTaskProps {
  id: SubmissionTaskId
  submissionId: SubmissionId
  fieldCompletionCriteriaId: FieldCompletionCriteriaId
  formFieldId: FormFieldId
  /** 収集すべき情報の説明 */
  criteria: string
  /** 完了条件 */
  doneCondition: string
  required: boolean
  status: TodoStatus
  collectedValue: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 回答タスクエンティティ（Submission集約の子）
 * 各completion criteriaに対して1つのタスクを管理する
 */
export class SubmissionTask implements TimestampedEntity<SubmissionTaskId> {
  private constructor(private readonly props: SubmissionTaskProps) {}

  get id(): SubmissionTaskId {
    return this.props.id
  }

  get submissionId(): SubmissionId {
    return this.props.submissionId
  }

  get fieldCompletionCriteriaId(): FieldCompletionCriteriaId {
    return this.props.fieldCompletionCriteriaId
  }

  get formFieldId(): FormFieldId {
    return this.props.formFieldId
  }

  get criteria(): string {
    return this.props.criteria
  }

  get doneCondition(): string {
    return this.props.doneCondition
  }

  get required(): boolean {
    return this.props.required
  }

  get status(): TodoStatus {
    return this.props.status
  }

  get collectedValue(): string | null {
    return this.props.collectedValue
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: SubmissionTaskProps): SubmissionTask {
    return new SubmissionTask(props)
  }

  static reconstruct(props: SubmissionTaskProps): SubmissionTask {
    return new SubmissionTask(props)
  }

  /**
   * ステータスを遷移する
   */
  transitionTo(nextStatus: TodoStatus): SubmissionTask {
    if (!this.props.status.canTransitionTo(nextStatus)) {
      throw new Error(
        `Cannot transition task from ${this.props.status.value} to ${nextStatus.value}`
      )
    }
    return new SubmissionTask({
      ...this.props,
      status: nextStatus,
      updatedAt: new Date(),
    })
  }

  /**
   * 収集値を設定してdoneに遷移する
   */
  markDone(collectedValue: string): SubmissionTask {
    if (!this.props.status.isValidating() && !this.props.status.isManualInput()) {
      throw new Error(`Cannot mark done from status: ${this.props.status.value}`)
    }
    return new SubmissionTask({
      ...this.props,
      status: TodoStatus.done(),
      collectedValue,
      updatedAt: new Date(),
    })
  }

  /**
   * 手入力フォールバックに切り替える
   */
  fallbackToManualInput(): SubmissionTask {
    return new SubmissionTask({
      ...this.props,
      status: TodoStatus.manualInput(),
      updatedAt: new Date(),
    })
  }

  /**
   * 確認画面での修正時にpendingに戻す
   */
  resetToPending(): SubmissionTask {
    if (!this.props.status.isDone()) {
      throw new Error(`Cannot reset to pending from status: ${this.props.status.value}`)
    }
    return new SubmissionTask({
      ...this.props,
      status: TodoStatus.pending(),
      collectedValue: null,
      updatedAt: new Date(),
    })
  }

  equals(other: SubmissionTask): boolean {
    return this.props.id.equals(other.props.id)
  }
}
