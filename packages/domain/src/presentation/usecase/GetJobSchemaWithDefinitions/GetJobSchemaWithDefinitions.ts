import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import type { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import type { FieldFactDefinition } from '../../../domain/entity/FieldFactDefinition/FieldFactDefinition'
import type { ProhibitedTopic } from '../../../domain/entity/ProhibitedTopic/ProhibitedTopic'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

export interface GetJobSchemaWithDefinitionsInput {
  jobId: string
}

export interface GetJobSchemaWithDefinitionsOutput {
  schemaVersion: JobSchemaVersion
  factDefinitions: FieldFactDefinition[]
  prohibitedTopics: ProhibitedTopic[]
}

export class GetJobSchemaWithDefinitions {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(
    input: GetJobSchemaWithDefinitionsInput
  ): Promise<Result<GetJobSchemaWithDefinitionsOutput, Error>> {
    const jobId = JobId.fromString(input.jobId)

    const schemaResult = await this.jobRepository.findLatestSchemaVersion(jobId)
    if (!schemaResult.success) {
      return R.err(schemaResult.error)
    }

    const schemaVersion = schemaResult.value
    if (!schemaVersion) {
      return R.err(new Error('No schema version found for job'))
    }

    const factsResult = await this.jobRepository.findFactDefinitionsBySchemaVersionId(
      schemaVersion.id
    )
    if (!factsResult.success) {
      return R.err(factsResult.error)
    }

    const topicsResult = await this.jobRepository.findProhibitedTopicsBySchemaVersionId(
      schemaVersion.id
    )
    if (!topicsResult.success) {
      return R.err(topicsResult.error)
    }

    return R.ok({
      schemaVersion,
      factDefinitions: factsResult.value,
      prohibitedTopics: topicsResult.value,
    })
  }
}
