import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import {
  job,
  jobFormField as jobFormFieldTable,
  jobSchemaVersion,
  fieldFactDefinition as fieldFactDefinitionTable,
} from '@ding/database/schema'
import { DrizzleApplicationRepository } from '../../../infrastructure/repository/DrizzleApplicationRepository'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import { GetApplicationUsecase } from './GetApplicationUsecase'

describe('GetApplicationUsecase', () => {
  let db: Database
  let applicationRepo: DrizzleApplicationRepository
  let usecase: GetApplicationUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'

  beforeAll(() => {
    db = createTestDatabase()
    applicationRepo = new DrizzleApplicationRepository(db)
    usecase = new GetApplicationUsecase({
      applicationRepository: applicationRepo,
    })
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    const now = new Date()
    await db.insert(job).values({
      id: jobIdVal,
      title: 'Test Job',
      status: 'open',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(jobFormFieldTable).values({
      id: fieldId,
      jobId: jobIdVal,
      fieldId: 'name',
      label: 'Name',
      required: true,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(jobSchemaVersion).values({
      id: svId,
      jobId: jobIdVal,
      version: 1,
      status: 'approved',
      approvedAt: now,
      createdAt: now,
    })
    await db.insert(fieldFactDefinitionTable).values({
      id: ffdId,
      schemaVersionId: svId,
      jobFormFieldId: fieldId,
      factKey: 'full_name',
      fact: 'Full name',
      doneCriteria: 'Name provided',
      sortOrder: 0,
      createdAt: now,
    })
  })

  const createApplication = (id = 'app-1') =>
    Application.reconstruct({
      id: ApplicationId.fromString(id),
      jobId: JobId.fromString(jobIdVal),
      schemaVersionId: JobSchemaVersionId.fromString(svId),
      applicantName: 'Test Applicant',
      applicantEmail: 'test@example.com',
      language: 'ja',
      country: 'JP',
      timezone: 'Asia/Tokyo',
      status: ApplicationStatus.new(),
      meetLink: null,
      extractionReviewedAt: null,
      consentCheckedAt: null,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  it('should get an existing application', async () => {
    const app = createApplication()
    await applicationRepo.save(app)

    const result = await usecase.execute({ applicationId: 'app-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.id.value).toBe('app-1')
      expect(result.value.applicantName).toBe('Test Applicant')
      expect(result.value.applicantEmail).toBe('test@example.com')
      expect(result.value.status.value).toBe('new')
    }
  })

  it('should return error for non-existent application', async () => {
    const result = await usecase.execute({ applicationId: 'non-existent' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('repository_error')
    }
  })
})
