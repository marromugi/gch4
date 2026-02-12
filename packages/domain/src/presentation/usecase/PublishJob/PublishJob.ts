import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import type { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

export interface PublishJobInput {
  jobId: string
}

export interface PublishJobOutput {
  job: Job
}

export class PublishJob {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(input: PublishJobInput): Promise<Result<PublishJobOutput, Error>> {
    const jobId = JobId.fromString(input.jobId)

    const jobResult = await this.jobRepository.findById(jobId)
    if (!jobResult.success) {
      return R.err(jobResult.error)
    }

    const schemaResult = await this.jobRepository.findLatestSchemaVersion(jobId)
    if (!schemaResult.success) {
      return R.err(schemaResult.error)
    }

    const latestSchema = schemaResult.value
    if (!latestSchema) {
      return R.err(new Error('No schema version found for job'))
    }

    if (!latestSchema.status.isApproved()) {
      return R.err(new Error('Schema version must be approved before publishing job'))
    }

    const publishedJob = jobResult.value.publish()

    const saveResult = await this.jobRepository.save(publishedJob)
    if (!saveResult.success) {
      return R.err(saveResult.error)
    }

    return R.ok({ job: publishedJob })
  }
}
