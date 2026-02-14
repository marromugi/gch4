import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { FormId } from '../../valueObject/FormId/FormId'
import type { UserId } from '../../valueObject/UserId/UserId'
import { FormStatus } from '../../valueObject/FormStatus/FormStatus'

export interface FormProps {
  id: FormId
  title: string
  description: string | null
  /** フォームの目的説明（AI生成の入力） */
  purpose: string | null
  /** 完了時メッセージ */
  completionMessage: string | null
  status: FormStatus
  createdBy: UserId
  createdAt: Date
  updatedAt: Date
}

/**
 * フォームエンティティ（Form集約ルート）
 */
export class Form implements TimestampedEntity<FormId> {
  private constructor(private readonly props: FormProps) {}

  get id(): FormId {
    return this.props.id
  }

  get title(): string {
    return this.props.title
  }

  get description(): string | null {
    return this.props.description
  }

  get purpose(): string | null {
    return this.props.purpose
  }

  get completionMessage(): string | null {
    return this.props.completionMessage
  }

  get status(): FormStatus {
    return this.props.status
  }

  get createdBy(): UserId {
    return this.props.createdBy
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: FormProps): Form {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Form title cannot be empty')
    }
    return new Form(props)
  }

  static reconstruct(props: FormProps): Form {
    return new Form(props)
  }

  /**
   * フォームを公開する（draft -> published）
   * SchemaVersionがapprovedであることは呼び出し側で保証する
   */
  publish(): Form {
    if (!this.props.status.canTransitionTo(FormStatus.published())) {
      throw new Error(`Cannot publish form in status: ${this.props.status.value}`)
    }
    return new Form({
      ...this.props,
      status: FormStatus.published(),
      updatedAt: new Date(),
    })
  }

  /**
   * フォームを閉じる（open -> closed）
   */
  close(): Form {
    if (!this.props.status.canTransitionTo(FormStatus.closed())) {
      throw new Error(`Cannot close form in status: ${this.props.status.value}`)
    }
    return new Form({
      ...this.props,
      status: FormStatus.closed(),
      updatedAt: new Date(),
    })
  }

  /**
   * タイトルを更新する
   */
  updateTitle(title: string): Form {
    if (!title || title.trim().length === 0) {
      throw new Error('Form title cannot be empty')
    }
    return new Form({
      ...this.props,
      title,
      updatedAt: new Date(),
    })
  }

  /**
   * 説明を更新する
   */
  updateDescription(description: string | null): Form {
    return new Form({
      ...this.props,
      description,
      updatedAt: new Date(),
    })
  }

  /**
   * 目的を更新する
   */
  updatePurpose(purpose: string | null): Form {
    return new Form({
      ...this.props,
      purpose,
      updatedAt: new Date(),
    })
  }

  /**
   * 完了時メッセージを更新する
   */
  updateCompletionMessage(completionMessage: string | null): Form {
    return new Form({
      ...this.props,
      completionMessage,
      updatedAt: new Date(),
    })
  }

  equals(other: Form): boolean {
    return this.props.id.equals(other.props.id)
  }
}
