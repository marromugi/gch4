import { Result } from '../../../domain/shared/Result/Result'
import { Job } from '../../../domain/entity/Job/Job'
import { JobFormField } from '../../../domain/entity/JobFormField/JobFormField'
import { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobSchemaVersionStatus } from '../../../domain/valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'

// --- Error ---

export class CreateJobValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(messages: string[]) {
    super(messages.join(', '))
    this.name = 'CreateJobValidationError'
  }
}

export class CreateJobRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(cause: Error) {
    super(cause.message)
    this.name = 'CreateJobRepositoryError'
  }
}

export type CreateJobError = CreateJobValidationError | CreateJobRepositoryError

// --- Input / Output ---

export interface CreateJobFormFieldInput {
  label: string
  intent: string | null
  required: boolean
}

export interface CreateJobInput {
  title: string
  idealCandidate: string | null
  cultureContext: string | null
  userId: string
  formFields: CreateJobFormFieldInput[]
}

export interface CreateJobDeps {
  jobRepository: IJobRepository
  generateId: () => string
}

export type CreateJobOutput = Job

// --- Usecase ---

export class CreateJobUsecase {
  constructor(private readonly deps: CreateJobDeps) {}

  async execute(input: CreateJobInput): Promise<Result<CreateJobOutput, CreateJobError>> {
    const validationErrors: string[] = []

    if (!input.title || input.title.trim().length === 0) {
      validationErrors.push('title is required')
    }

    if (!input.userId || input.userId.trim().length === 0) {
      validationErrors.push('userId is required')
    }

    for (const [i, field] of input.formFields.entries()) {
      if (!field.label || field.label.trim().length === 0) {
        validationErrors.push(`formFields[${i}].label is required`)
      }
    }

    if (validationErrors.length > 0) {
      return Result.err(new CreateJobValidationError(validationErrors))
    }

    const now = new Date()
    const jobId = JobId.fromString(this.deps.generateId())
    const userId = UserId.fromString(input.userId)

    const job = Job.create({
      id: jobId,
      title: input.title,
      description: null,
      idealCandidate: input.idealCandidate,
      cultureContext: input.cultureContext,
      status: JobStatus.draft(),
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    const saveJobResult = await this.deps.jobRepository.save(job)
    if (Result.isErr(saveJobResult)) {
      return Result.err(new CreateJobRepositoryError(saveJobResult.error))
    }

    // Create form fields
    const formFields = input.formFields.map((field, index) =>
      JobFormField.create({
        id: JobFormFieldId.fromString(this.deps.generateId()),
        jobId,
        fieldId: this.deps.generateId(),
        label: field.label,
        intent: field.intent,
        required: field.required,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })
    )

    if (formFields.length > 0) {
      const saveFieldsResult = await this.deps.jobRepository.saveFormFields(formFields)
      if (Result.isErr(saveFieldsResult)) {
        return Result.err(new CreateJobRepositoryError(saveFieldsResult.error))
      }
    }

    // Create initial schema version (draft)
    const schemaVersion = JobSchemaVersion.create({
      id: JobSchemaVersionId.fromString(this.deps.generateId()),
      jobId,
      version: 1,
      status: JobSchemaVersionStatus.draft(),
      approvedAt: null,
      createdAt: now,
    })

    const saveVersionResult = await this.deps.jobRepository.saveSchemaVersion(schemaVersion)
    if (Result.isErr(saveVersionResult)) {
      return Result.err(new CreateJobRepositoryError(saveVersionResult.error))
    }

    return Result.ok(job)
  }
}
