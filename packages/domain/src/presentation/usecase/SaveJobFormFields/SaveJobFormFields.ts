import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { JobFormField } from '../../../domain/entity/JobFormField/JobFormField'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'

export interface SaveJobFormFieldsInput {
  jobId: string
  fields: {
    id: string
    fieldId: string
    label: string
    intent: string | null
    required: boolean
    sortOrder: number
  }[]
}

export interface SaveJobFormFieldsOutput {
  fields: JobFormField[]
}

export class SaveJobFormFields {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(input: SaveJobFormFieldsInput): Promise<Result<SaveJobFormFieldsOutput, Error>> {
    const jobId = JobId.fromString(input.jobId)

    const jobResult = await this.jobRepository.findById(jobId)
    if (!jobResult.success) {
      return R.err(jobResult.error)
    }

    const now = new Date()
    const fields = input.fields.map((f) =>
      JobFormField.create({
        id: JobFormFieldId.fromString(f.id),
        jobId,
        fieldId: f.fieldId,
        label: f.label,
        intent: f.intent,
        required: f.required,
        sortOrder: f.sortOrder,
        createdAt: now,
        updatedAt: now,
      })
    )

    const saveResult = await this.jobRepository.saveFormFields(fields)
    if (!saveResult.success) {
      return R.err(saveResult.error)
    }

    return R.ok({ fields })
  }
}
