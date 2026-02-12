import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import type { Job } from '../../../domain/entity/Job/Job'
import { UserId } from '../../../domain/valueObject/UserId/UserId'

export interface ListJobsByUserInput {
  userId: string
}

export interface ListJobsByUserOutput {
  jobs: Job[]
}

export class ListJobsByUser {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(input: ListJobsByUserInput): Promise<Result<ListJobsByUserOutput, Error>> {
    const userId = UserId.fromString(input.userId)
    const result = await this.jobRepository.findByCreatedBy(userId)
    if (!result.success) {
      return R.err(result.error)
    }

    return R.ok({ jobs: result.value })
  }
}
