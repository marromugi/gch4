import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import type { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

export interface GetJobInput {
  jobId: string
}

export interface GetJobOutput {
  job: Job
}

export class GetJob {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(input: GetJobInput): Promise<Result<GetJobOutput, Error>> {
    const jobId = JobId.fromString(input.jobId)
    const result = await this.jobRepository.findById(jobId)
    if (!result.success) {
      return R.err(result.error)
    }

    return R.ok({ job: result.value })
  }
}
