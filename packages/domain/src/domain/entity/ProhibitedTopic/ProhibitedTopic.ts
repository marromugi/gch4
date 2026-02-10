import type { Entity } from '../../shared/Entity/Entity'
import type { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import type { JobFormFieldId } from '../../valueObject/JobFormFieldId/JobFormFieldId'

export interface ProhibitedTopicProps {
  id: string
  schemaVersionId: JobSchemaVersionId
  jobFormFieldId: JobFormFieldId
  topic: string
  createdAt: Date
}

/**
 * 禁止トピックエンティティ（JobSchemaVersionの子）
 */
export class ProhibitedTopic implements Entity<string> {
  private constructor(private readonly props: ProhibitedTopicProps) {}

  get id(): string {
    return this.props.id
  }

  get schemaVersionId(): JobSchemaVersionId {
    return this.props.schemaVersionId
  }

  get jobFormFieldId(): JobFormFieldId {
    return this.props.jobFormFieldId
  }

  get topic(): string {
    return this.props.topic
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  static create(props: ProhibitedTopicProps): ProhibitedTopic {
    if (!props.topic || props.topic.trim().length === 0) {
      throw new Error('ProhibitedTopic topic cannot be empty')
    }
    return new ProhibitedTopic(props)
  }

  static reconstruct(props: ProhibitedTopicProps): ProhibitedTopic {
    return new ProhibitedTopic(props)
  }

  equals(other: ProhibitedTopic): boolean {
    return this.props.id === other.props.id
  }
}
