import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import type { UserId } from '../../../domain/valueObject/UserId/UserId'

export interface CreateJobInput {
  jobId: string
  title: string
  description: string | null
  idealCandidate: string | null
  cultureContext: string | null
  createdBy: UserId
}

export interface CreateJobOutput {
  job: Job
}

export class CreateJob {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(input: CreateJobInput): Promise<Result<CreateJobOutput, Error>> {
    const now = new Date()

    const job = Job.create({
      id: JobId.fromString(input.jobId),
      title: input.title,
      description: input.description,
      idealCandidate: input.idealCandidate,
      cultureContext: input.cultureContext,
      status: JobStatus.draft(),
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    })

    const saveResult = await this.jobRepository.save(job)
    if (!saveResult.success) {
      return R.err(saveResult.error)
    }

    return R.ok({ job })
  }
}
