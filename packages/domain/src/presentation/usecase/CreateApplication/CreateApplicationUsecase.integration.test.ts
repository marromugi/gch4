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
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { CreateApplicationUsecase } from './CreateApplicationUsecase'

describe('CreateApplicationUsecase', () => {
  let db: Database
  let applicationRepo: DrizzleApplicationRepository
  let jobRepo: DrizzleJobRepository
  let usecase: CreateApplicationUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'

  beforeAll(() => {
    db = createTestDatabase()
    applicationRepo = new DrizzleApplicationRepository(db)
    jobRepo = new DrizzleJobRepository(db)
    usecase = new CreateApplicationUsecase({
      applicationRepository: applicationRepo,
      jobRepository: jobRepo,
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

  it('should create an application successfully', async () => {
    const result = await usecase.execute({
      applicationId: 'app-1',
      jobId: jobIdVal,
      schemaVersionId: svId,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.id.value).toBe('app-1')
      expect(result.value.jobId.value).toBe(jobIdVal)
      expect(result.value.schemaVersionId.value).toBe(svId)
      expect(result.value.status.value).toBe('new')
      expect(result.value.applicantName).toBeNull()
      expect(result.value.submittedAt).toBeNull()
    }
  })

  it('should persist the application to database', async () => {
    await usecase.execute({
      applicationId: 'app-1',
      jobId: jobIdVal,
      schemaVersionId: svId,
    })

    const findResult = await applicationRepo.findById(
      (
        await import('../../../domain/valueObject/ApplicationId/ApplicationId')
      ).ApplicationId.fromString('app-1')
    )
    expect(findResult.success).toBe(true)
    if (findResult.success) {
      expect(findResult.value.id.value).toBe('app-1')
    }
  })

  it('should return error when job does not exist', async () => {
    const result = await usecase.execute({
      applicationId: 'app-1',
      jobId: 'non-existent-job',
      schemaVersionId: svId,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('repository_error')
    }
  })

  it('should return error when job has no schema version', async () => {
    const now = new Date()
    const jobId2 = 'test-job-no-schema'
    await db.insert(job).values({
      id: jobId2,
      title: 'Job Without Schema',
      status: 'open',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    const result = await usecase.execute({
      applicationId: 'app-1',
      jobId: jobId2,
      schemaVersionId: 'any',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('no_schema_version')
    }
  })
})
