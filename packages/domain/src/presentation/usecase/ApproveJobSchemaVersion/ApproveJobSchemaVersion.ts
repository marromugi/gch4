import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import type { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

export interface ApproveJobSchemaVersionInput {
  jobId: string
  schemaVersionId: string
}

export interface ApproveJobSchemaVersionOutput {
  schemaVersion: JobSchemaVersion
}

export class ApproveJobSchemaVersion {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(
    input: ApproveJobSchemaVersionInput
  ): Promise<Result<ApproveJobSchemaVersionOutput, Error>> {
    const jobId = JobId.fromString(input.jobId)

    const schemaResult = await this.jobRepository.findLatestSchemaVersion(jobId)
    if (!schemaResult.success) {
      return R.err(schemaResult.error)
    }

    const schema = schemaResult.value
    if (!schema) {
      return R.err(new Error('No schema version found for job'))
    }

    const expectedId = JobSchemaVersionId.fromString(input.schemaVersionId)
    if (!schema.id.equals(expectedId)) {
      return R.err(new Error('Schema version ID mismatch with latest version'))
    }

    const approvedSchema = schema.approve()

    const saveResult = await this.jobRepository.saveSchemaVersion(approvedSchema)
    if (!saveResult.success) {
      return R.err(saveResult.error)
    }

    return R.ok({ schemaVersion: approvedSchema })
  }
}
