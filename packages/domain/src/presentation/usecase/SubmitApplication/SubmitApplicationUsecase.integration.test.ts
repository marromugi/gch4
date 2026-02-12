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
import { ApplicationTodo } from '../../../domain/entity/ApplicationTodo/ApplicationTodo'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import { ApplicationTodoId } from '../../../domain/valueObject/ApplicationTodoId/ApplicationTodoId'
import { FieldFactDefinitionId } from '../../../domain/valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { TodoStatus } from '../../../domain/valueObject/TodoStatus/TodoStatus'
import { ApplicationSubmissionService } from '../../../domain/service/ApplicationSubmissionService/ApplicationSubmissionService'
import { SubmitApplicationUsecase } from './SubmitApplicationUsecase'

describe('SubmitApplicationUsecase', () => {
  let db: Database
  let applicationRepo: DrizzleApplicationRepository
  let submissionService: ApplicationSubmissionService
  let usecase: SubmitApplicationUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'

  beforeAll(() => {
    db = createTestDatabase()
    applicationRepo = new DrizzleApplicationRepository(db)
    submissionService = new ApplicationSubmissionService()
    usecase = new SubmitApplicationUsecase({
      applicationRepository: applicationRepo,
      submissionService,
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

  const createReadyApplication = (id = 'app-1') => {
    const now = new Date()
    return Application.reconstruct({
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
      extractionReviewedAt: now,
      consentCheckedAt: now,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  const createDoneTodo = (appId: string, todoId: string) =>
    ApplicationTodo.reconstruct({
      id: ApplicationTodoId.fromString(todoId),
      applicationId: ApplicationId.fromString(appId),
      fieldFactDefinitionId: FieldFactDefinitionId.fromString(ffdId),
      jobFormFieldId: JobFormFieldId.fromString(fieldId),
      fact: 'Full name',
      doneCriteria: 'Name provided',
      required: true,
      status: TodoStatus.done(),
      extractedValue: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  it('should submit an application successfully when all conditions are met', async () => {
    const app = createReadyApplication()
    await applicationRepo.save(app)

    const todo = createDoneTodo('app-1', 'todo-1')
    await applicationRepo.saveTodo(todo)

    const result = await usecase.execute({ applicationId: 'app-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.submittedAt).not.toBeNull()
      expect(result.value.id.value).toBe('app-1')
    }
  })

  it('should persist the submitted application to database', async () => {
    const app = createReadyApplication()
    await applicationRepo.save(app)

    const todo = createDoneTodo('app-1', 'todo-1')
    await applicationRepo.saveTodo(todo)

    await usecase.execute({ applicationId: 'app-1' })

    const findResult = await applicationRepo.findById(ApplicationId.fromString('app-1'))
    expect(findResult.success).toBe(true)
    if (findResult.success) {
      expect(findResult.value.submittedAt).not.toBeNull()
    }
  })

  it('should return validation error when extraction is not reviewed', async () => {
    const now = new Date()
    const app = Application.reconstruct({
      id: ApplicationId.fromString('app-1'),
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
      createdAt: now,
      updatedAt: now,
    })
    await applicationRepo.save(app)

    const result = await usecase.execute({ applicationId: 'app-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('validation_error')
    }
  })

  it('should return validation error when consent is not checked', async () => {
    const now = new Date()
    const app = Application.reconstruct({
      id: ApplicationId.fromString('app-1'),
      jobId: JobId.fromString(jobIdVal),
      schemaVersionId: JobSchemaVersionId.fromString(svId),
      applicantName: 'Test Applicant',
      applicantEmail: 'test@example.com',
      language: 'ja',
      country: 'JP',
      timezone: 'Asia/Tokyo',
      status: ApplicationStatus.new(),
      meetLink: null,
      extractionReviewedAt: now,
      consentCheckedAt: null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    await applicationRepo.save(app)

    const result = await usecase.execute({ applicationId: 'app-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('validation_error')
    }
  })

  it('should return validation error when required todos are incomplete', async () => {
    const app = createReadyApplication()
    await applicationRepo.save(app)

    const pendingTodo = ApplicationTodo.reconstruct({
      id: ApplicationTodoId.fromString('todo-1'),
      applicationId: ApplicationId.fromString('app-1'),
      fieldFactDefinitionId: FieldFactDefinitionId.fromString(ffdId),
      jobFormFieldId: JobFormFieldId.fromString(fieldId),
      fact: 'Full name',
      doneCriteria: 'Name provided',
      required: true,
      status: TodoStatus.pending(),
      extractedValue: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await applicationRepo.saveTodo(pendingTodo)

    const result = await usecase.execute({ applicationId: 'app-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('validation_error')
    }
  })

  it('should return repository error for non-existent application', async () => {
    const result = await usecase.execute({ applicationId: 'non-existent' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.type).toBe('repository_error')
    }
  })

  it('should succeed when non-required todos are incomplete', async () => {
    const app = createReadyApplication()
    await applicationRepo.save(app)

    const doneTodo = createDoneTodo('app-1', 'todo-1')
    await applicationRepo.saveTodo(doneTodo)

    const optionalPendingTodo = ApplicationTodo.reconstruct({
      id: ApplicationTodoId.fromString('todo-2'),
      applicationId: ApplicationId.fromString('app-1'),
      fieldFactDefinitionId: FieldFactDefinitionId.fromString(ffdId),
      jobFormFieldId: JobFormFieldId.fromString(fieldId),
      fact: 'Optional fact',
      doneCriteria: 'Optional criteria',
      required: false,
      status: TodoStatus.pending(),
      extractedValue: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await applicationRepo.saveTodo(optionalPendingTodo)

    const result = await usecase.execute({ applicationId: 'app-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.submittedAt).not.toBeNull()
    }
  })
})
