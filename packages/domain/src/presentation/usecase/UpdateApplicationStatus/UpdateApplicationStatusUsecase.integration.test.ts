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
import { UpdateApplicationStatusUsecase } from './UpdateApplicationStatusUsecase'

describe('UpdateApplicationStatusUsecase', () => {
  let db: Database
  let applicationRepo: DrizzleApplicationRepository
  let usecase: UpdateApplicationStatusUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'

  beforeAll(() => {
    db = createTestDatabase()
    applicationRepo = new DrizzleApplicationRepository(db)
    usecase = new UpdateApplicationStatusUsecase({
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

  const createApplication = (id = 'app-1', status: ApplicationStatus = ApplicationStatus.new()) =>
    Application.reconstruct({
      id: ApplicationId.fromString(id),
      jobId: JobId.fromString(jobIdVal),
      schemaVersionId: JobSchemaVersionId.fromString(svId),
      applicantName: 'Test Applicant',
      applicantEmail: 'test@example.com',
      language: 'ja',
      country: 'JP',
      timezone: 'Asia/Tokyo',
      status,
      meetLink: null,
      extractionReviewedAt: null,
      consentCheckedAt: null,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  it('should transition from new to scheduling', async () => {
    await applicationRepo.save(createApplication())

    const result = await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'scheduling',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.status.value).toBe('scheduling')
    }
  })

  it('should transition from new to closed', async () => {
    await applicationRepo.save(createApplication())

    const result = await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'closed',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.status.value).toBe('closed')
    }
  })

  it('should transition from scheduling to interviewed', async () => {
    await applicationRepo.save(createApplication('app-1', ApplicationStatus.scheduling()))

    const result = await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'interviewed',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.status.value).toBe('interviewed')
    }
  })

  it('should transition from interviewed to closed', async () => {
    await applicationRepo.save(createApplication('app-1', ApplicationStatus.interviewed()))

    const result = await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'closed',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.status.value).toBe('closed')
    }
  })

  it('should persist the updated status to database', async () => {
    await applicationRepo.save(createApplication())

    await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'scheduling',
    })

    const findResult = await applicationRepo.findById(ApplicationId.fromString('app-1'))
    expect(findResult.success).toBe(true)
    if (findResult.success) {
      expect(findResult.value.status.value).toBe('scheduling')
    }
  })

  it('should return transition error for invalid transition (new -> interviewed)', async () => {
    await applicationRepo.save(createApplication())

    const result = await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'interviewed',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('transition_error')
    }
  })

  it('should return transition error for invalid transition (closed -> new)', async () => {
    await applicationRepo.save(createApplication('app-1', ApplicationStatus.closed()))

    const result = await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'new',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('transition_error')
    }
  })

  it('should return transition error for invalid status string', async () => {
    await applicationRepo.save(createApplication())

    const result = await usecase.execute({
      applicationId: 'app-1',
      newStatus: 'invalid_status',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('transition_error')
    }
  })

  it('should return repository error for non-existent application', async () => {
    const result = await usecase.execute({
      applicationId: 'non-existent',
      newStatus: 'scheduling',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('repository_error')
    }
  })
})
