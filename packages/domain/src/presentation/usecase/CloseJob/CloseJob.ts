import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import type { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

export interface CloseJobInput {
  jobId: string
}

export interface CloseJobOutput {
  job: Job
}

export class CloseJob {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(input: CloseJobInput): Promise<Result<CloseJobOutput, Error>> {
    const jobId = JobId.fromString(input.jobId)

    const jobResult = await this.jobRepository.findById(jobId)
    if (!jobResult.success) {
      return R.err(jobResult.error)
    }

    const closedJob = jobResult.value.close()

    const saveResult = await this.jobRepository.save(closedJob)
    if (!saveResult.success) {
      return R.err(saveResult.error)
    }

    return R.ok({ job: closedJob })
  }
}
