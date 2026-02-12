import { Result } from '../../../domain/shared/Result/Result'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import type { IJobRepository } from '../../../domain/repository/IJobRepository/IJobRepository'

export class CreateApplicationNotFoundError extends Error {
  readonly type = 'not_found' as const
  constructor(message: string) {
    super(message)
    this.name = 'CreateApplicationNotFoundError'
  }
}

export class CreateApplicationNoSchemaVersionError extends Error {
  readonly type = 'no_schema_version' as const
  constructor(message: string) {
    super(message)
    this.name = 'CreateApplicationNoSchemaVersionError'
  }
}

export class CreateApplicationRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'CreateApplicationRepositoryError'
  }
}

export type CreateApplicationError =
  | CreateApplicationNotFoundError
  | CreateApplicationNoSchemaVersionError
  | CreateApplicationRepositoryError

export interface CreateApplicationInput {
  applicationId: string
  jobId: string
  schemaVersionId: string
}

export type CreateApplicationOutput = Application

export interface CreateApplicationDeps {
  applicationRepository: IApplicationRepository
  jobRepository: IJobRepository
}

export class CreateApplicationUsecase {
  constructor(private readonly deps: CreateApplicationDeps) {}

  async execute(
    input: CreateApplicationInput
  ): Promise<Result<CreateApplicationOutput, CreateApplicationError>> {
    const applicationId = ApplicationId.fromString(input.applicationId)
    const jobId = JobId.fromString(input.jobId)

    // Jobの存在確認
    const jobResult = await this.deps.jobRepository.findById(jobId)
    if (!jobResult.success) {
      return Result.err(new CreateApplicationRepositoryError(jobResult.error.message))
    }

    // 最新スキーマバージョンの取得
    const schemaVersionResult = await this.deps.jobRepository.findLatestSchemaVersion(jobId)
    if (!schemaVersionResult.success) {
      return Result.err(new CreateApplicationRepositoryError(schemaVersionResult.error.message))
    }
    if (!schemaVersionResult.value) {
      return Result.err(
        new CreateApplicationNoSchemaVersionError(`No schema version found for job: ${input.jobId}`)
      )
    }

    const now = new Date()
    const application = Application.create({
      id: applicationId,
      jobId,
      schemaVersionId: schemaVersionResult.value.id,
      applicantName: null,
      applicantEmail: null,
      language: null,
      country: null,
      timezone: null,
      status: ApplicationStatus.new(),
      meetLink: null,
      extractionReviewedAt: null,
      consentCheckedAt: null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    })

    const saveResult = await this.deps.applicationRepository.save(application)
    if (!saveResult.success) {
      return Result.err(new CreateApplicationRepositoryError(saveResult.error.message))
    }

    return Result.ok(application)
  }
}
