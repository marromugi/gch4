import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { ApplicationTodoId } from '../../valueObject/ApplicationTodoId/ApplicationTodoId'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import type { FieldFactDefinitionId } from '../../valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import type { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'
import { TodoStatus } from '../../valueObject/TodoStatus/TodoStatus'

export interface ApplicationTodoProps {
  id: ApplicationTodoId
  applicationId: ApplicationId
  fieldFactDefinitionId: FieldFactDefinitionId
  jobFormFieldId: JobFormFieldId
  fact: string
  doneCriteria: string
  required: boolean
  status: TodoStatus
  extractedValue: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 応募Todoエンティティ（Application集約の子）
 * 各required_factに対して1つのTodoを管理する
 */
export class ApplicationTodo implements TimestampedEntity<ApplicationTodoId> {
  private constructor(private readonly props: ApplicationTodoProps) {}

  get id(): ApplicationTodoId {
    return this.props.id
  }

  get applicationId(): ApplicationId {
    return this.props.applicationId
  }

  get fieldFactDefinitionId(): FieldFactDefinitionId {
    return this.props.fieldFactDefinitionId
  }

  get jobFormFieldId(): JobFormFieldId {
    return this.props.jobFormFieldId
  }

  get fact(): string {
    return this.props.fact
  }

  get doneCriteria(): string {
    return this.props.doneCriteria
  }

  get required(): boolean {
    return this.props.required
  }

  get status(): TodoStatus {
    return this.props.status
  }

  get extractedValue(): string | null {
    return this.props.extractedValue
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: ApplicationTodoProps): ApplicationTodo {
    return new ApplicationTodo(props)
  }

  static reconstruct(props: ApplicationTodoProps): ApplicationTodo {
    return new ApplicationTodo(props)
  }

  /**
   * ステータスを遷移する
   */
  transitionTo(nextStatus: TodoStatus): ApplicationTodo {
    if (!this.props.status.canTransitionTo(nextStatus)) {
      throw new Error(
        `Cannot transition todo from ${this.props.status.value} to ${nextStatus.value}`
      )
    }
    return new ApplicationTodo({
      ...this.props,
      status: nextStatus,
      updatedAt: new Date(),
    })
  }

  /**
   * 抽出値を設定してdoneに遷移する
   */
  markDone(extractedValue: string): ApplicationTodo {
    if (!this.props.status.isValidating() && !this.props.status.isManualInput()) {
      throw new Error(`Cannot mark done from status: ${this.props.status.value}`)
    }
    return new ApplicationTodo({
      ...this.props,
      status: TodoStatus.done(),
      extractedValue,
      updatedAt: new Date(),
    })
  }

  /**
   * 手入力フォールバックに切り替える
   */
  fallbackToManualInput(): ApplicationTodo {
    return new ApplicationTodo({
      ...this.props,
      status: TodoStatus.manualInput(),
      updatedAt: new Date(),
    })
  }

  /**
   * 確認画面での修正時にpendingに戻す
   */
  resetToPending(): ApplicationTodo {
    if (!this.props.status.isDone()) {
      throw new Error(`Cannot reset to pending from status: ${this.props.status.value}`)
    }
    return new ApplicationTodo({
      ...this.props,
      status: TodoStatus.pending(),
      extractedValue: null,
      updatedAt: new Date(),
    })
  }

  equals(other: ApplicationTodo): boolean {
    return this.props.id.equals(other.props.id)
  }
}
