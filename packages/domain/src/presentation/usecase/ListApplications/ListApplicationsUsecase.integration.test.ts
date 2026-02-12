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
import { ListApplicationsUsecase } from './ListApplicationsUsecase'

describe('ListApplicationsUsecase', () => {
  let db: Database
  let applicationRepo: DrizzleApplicationRepository
  let usecase: ListApplicationsUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'

  beforeAll(() => {
    db = createTestDatabase()
    applicationRepo = new DrizzleApplicationRepository(db)
    usecase = new ListApplicationsUsecase({
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

  const createApplication = (id: string) =>
    Application.reconstruct({
      id: ApplicationId.fromString(id),
      jobId: JobId.fromString(jobIdVal),
      schemaVersionId: JobSchemaVersionId.fromString(svId),
      applicantName: `Applicant ${id}`,
      applicantEmail: `${id}@example.com`,
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

  it('should list applications by job id', async () => {
    await applicationRepo.save(createApplication('app-1'))
    await applicationRepo.save(createApplication('app-2'))
    await applicationRepo.save(createApplication('app-3'))

    const result = await usecase.execute({ jobId: jobIdVal })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value).toHaveLength(3)
    }
  })

  it('should return empty array when no applications exist', async () => {
    const result = await usecase.execute({ jobId: jobIdVal })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value).toHaveLength(0)
    }
  })

  it('should only return applications for the specified job', async () => {
    await applicationRepo.save(createApplication('app-1'))

    const now = new Date()
    const otherJobId = 'test-job-2'
    await db.insert(job).values({
      id: otherJobId,
      title: 'Other Job',
      status: 'open',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(jobFormFieldTable).values({
      id: 'field-2',
      jobId: otherJobId,
      fieldId: 'name',
      label: 'Name',
      required: true,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    await db.insert(jobSchemaVersion).values({
      id: 'sv-2',
      jobId: otherJobId,
      version: 1,
      status: 'approved',
      approvedAt: now,
      createdAt: now,
    })
    await db.insert(fieldFactDefinitionTable).values({
      id: 'ffd-2',
      schemaVersionId: 'sv-2',
      jobFormFieldId: 'field-2',
      factKey: 'full_name',
      fact: 'Full name',
      doneCriteria: 'Name provided',
      sortOrder: 0,
      createdAt: now,
    })

    const otherApp = Application.reconstruct({
      id: ApplicationId.fromString('app-other'),
      jobId: JobId.fromString(otherJobId),
      schemaVersionId: JobSchemaVersionId.fromString('sv-2'),
      applicantName: 'Other Applicant',
      applicantEmail: 'other@example.com',
      language: 'en',
      country: 'US',
      timezone: 'America/New_York',
      status: ApplicationStatus.new(),
      meetLink: null,
      extractionReviewedAt: null,
      consentCheckedAt: null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    await applicationRepo.save(otherApp)

    const result = await usecase.execute({ jobId: jobIdVal })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value).toHaveLength(1)
      expect(result.value[0].id.value).toBe('app-1')
    }
  })
})
