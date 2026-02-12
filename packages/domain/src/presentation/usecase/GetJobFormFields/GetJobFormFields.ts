import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import type { JobFormField } from '../../../domain/entity/JobFormField/JobFormField'
import { JobId } from '../../../domain/valueObject/JobId/JobId'

export interface GetJobFormFieldsInput {
  jobId: string
}

export interface GetJobFormFieldsOutput {
  fields: JobFormField[]
}

export class GetJobFormFields {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(input: GetJobFormFieldsInput): Promise<Result<GetJobFormFieldsOutput, Error>> {
    const jobId = JobId.fromString(input.jobId)

    const result = await this.jobRepository.findFormFieldsByJobId(jobId)
    if (!result.success) {
      return R.err(result.error)
    }

    return R.ok({ fields: result.value })
  }
}
