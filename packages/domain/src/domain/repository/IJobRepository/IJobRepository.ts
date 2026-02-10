import type { Result } from '../../shared/Result/Result'
import type { Job } from '../../entity/Job/Job'
import type { JobFormField } from '../../entity/JobFormField/JobFormField'
import type { JobSchemaVersion } from '../../entity/JobSchemaVersion/JobSchemaVersion'
import type { FieldFactDefinition } from '../../entity/FieldFactDefinition/FieldFactDefinition'
import type { ProhibitedTopic } from '../../entity/ProhibitedTopic/ProhibitedTopic'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { UserId } from '../../valueObject/UserId/UserId'
import type { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'

export interface IJobRepository {
  findById(id: JobId): Promise<Result<Job, Error>>
  findByCreatedBy(userId: UserId): Promise<Result<Job[], Error>>
  save(job: Job): Promise<Result<void, Error>>
  delete(id: JobId): Promise<Result<void, Error>>

  // JobFormField
  findFormFieldsByJobId(jobId: JobId): Promise<Result<JobFormField[], Error>>
  saveFormField(field: JobFormField): Promise<Result<void, Error>>
  saveFormFields(fields: JobFormField[]): Promise<Result<void, Error>>

  // JobSchemaVersion
  findSchemaVersionsByJobId(jobId: JobId): Promise<Result<JobSchemaVersion[], Error>>
  findLatestSchemaVersion(jobId: JobId): Promise<Result<JobSchemaVersion | null, Error>>
  saveSchemaVersion(version: JobSchemaVersion): Promise<Result<void, Error>>

  // FieldFactDefinition
  findFactDefinitionsBySchemaVersionId(
    schemaVersionId: JobSchemaVersionId
  ): Promise<Result<FieldFactDefinition[], Error>>
  saveFactDefinitions(definitions: FieldFactDefinition[]): Promise<Result<void, Error>>

  // ProhibitedTopic
  findProhibitedTopicsBySchemaVersionId(
    schemaVersionId: JobSchemaVersionId
  ): Promise<Result<ProhibitedTopic[], Error>>
  saveProhibitedTopics(topics: ProhibitedTopic[]): Promise<Result<void, Error>>
}
