import type { Entity } from '../../shared/Entity/Entity'
import type { FieldCompletionCriteriaId } from '../../valueObject/FieldCompletionCriteriaId/FieldCompletionCriteriaId'
import type { FormSchemaVersionId } from '../../valueObject/FormSchemaVersionId/FormSchemaVersionId'
import type { FormFieldId } from '../../valueObject/FormFieldId/FormFieldId'

export interface FieldCompletionCriteriaProps {
  id: FieldCompletionCriteriaId
  schemaVersionId: FormSchemaVersionId
  formFieldId: FormFieldId
  criteriaKey: string
  /** 収集すべき情報の説明 */
  criteria: string
  /** 完了条件 */
  doneCondition: string
  /** 質問ヒント */
  questioningHints: string | null
  sortOrder: number
  createdAt: Date
}

/**
 * フィールド完了条件エンティティ（FormSchemaVersionの子）
 * LLM自動生成の1 criteria = 1行
 */
export class FieldCompletionCriteria implements Entity<FieldCompletionCriteriaId> {
  private constructor(private readonly props: FieldCompletionCriteriaProps) {}

  get id(): FieldCompletionCriteriaId {
    return this.props.id
  }

  get schemaVersionId(): FormSchemaVersionId {
    return this.props.schemaVersionId
  }

  get formFieldId(): FormFieldId {
    return this.props.formFieldId
  }

  get criteriaKey(): string {
    return this.props.criteriaKey
  }

  get criteria(): string {
    return this.props.criteria
  }

  get doneCondition(): string {
    return this.props.doneCondition
  }

  get questioningHints(): string | null {
    return this.props.questioningHints
  }

  get sortOrder(): number {
    return this.props.sortOrder
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: FieldCompletionCriteriaProps): FieldCompletionCriteria {
    if (!props.criteriaKey || props.criteriaKey.trim().length === 0) {
      throw new Error('FieldCompletionCriteria criteriaKey cannot be empty')
    }
    if (!props.criteria || props.criteria.trim().length === 0) {
      throw new Error('FieldCompletionCriteria criteria cannot be empty')
    }
    if (!props.doneCondition || props.doneCondition.trim().length === 0) {
      throw new Error('FieldCompletionCriteria doneCondition cannot be empty')
    }
    return new FieldCompletionCriteria(props)
  }

  static reconstruct(props: FieldCompletionCriteriaProps): FieldCompletionCriteria {
    return new FieldCompletionCriteria(props)
  }

  equals(other: FieldCompletionCriteria): boolean {
    return this.props.id.equals(other.props.id)
  }
}
