import type { Entity } from '../../shared/Entity/Entity'
import type { FieldFactDefinitionId } from '../../valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import type { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import type { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'

export interface FieldFactDefinitionProps {
  id: FieldFactDefinitionId
  schemaVersionId: JobSchemaVersionId
  jobFormFieldId: JobFormFieldId
  factKey: string
  fact: string
  doneCriteria: string
  questioningHints: string | null
  sortOrder: number
  createdAt: Date
}

/**
 * フィールドFact定義エンティティ（JobSchemaVersionの子）
 * LLM自動生成の1 fact = 1行
 */
export class FieldFactDefinition implements Entity<FieldFactDefinitionId> {
  private constructor(private readonly props: FieldFactDefinitionProps) {}

  get id(): FieldFactDefinitionId {
    return this.props.id
  }

  get schemaVersionId(): JobSchemaVersionId {
    return this.props.schemaVersionId
  }

  get jobFormFieldId(): JobFormFieldId {
    return this.props.jobFormFieldId
  }

  get factKey(): string {
    return this.props.factKey
  }

  get fact(): string {
    return this.props.fact
  }

  get doneCriteria(): string {
    return this.props.doneCriteria
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

  static create(props: FieldFactDefinitionProps): FieldFactDefinition {
    if (!props.factKey || props.factKey.trim().length === 0) {
      throw new Error('FieldFactDefinition factKey cannot be empty')
    }
    if (!props.fact || props.fact.trim().length === 0) {
      throw new Error('FieldFactDefinition fact cannot be empty')
    }
    if (!props.doneCriteria || props.doneCriteria.trim().length === 0) {
      throw new Error('FieldFactDefinition doneCriteria cannot be empty')
    }
    return new FieldFactDefinition(props)
  }

  static reconstruct(props: FieldFactDefinitionProps): FieldFactDefinition {
    return new FieldFactDefinition(props)
  }

  equals(other: FieldFactDefinition): boolean {
    return this.props.id.equals(other.props.id)
  }
}
