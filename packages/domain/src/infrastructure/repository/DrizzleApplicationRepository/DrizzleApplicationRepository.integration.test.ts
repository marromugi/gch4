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
import { DrizzleApplicationRepository } from './DrizzleApplicationRepository'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationTodo } from '../../../domain/entity/ApplicationTodo/ApplicationTodo'
import { ExtractedField } from '../../../domain/entity/ExtractedField/ExtractedField'
import { ConsentLog } from '../../../domain/entity/ConsentLog/ConsentLog'
import { ChatSession } from '../../../domain/entity/ChatSession/ChatSession'
import { ChatMessage } from '../../../domain/entity/ChatMessage/ChatMessage'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import { ApplicationTodoId } from '../../../domain/valueObject/ApplicationTodoId/ApplicationTodoId'
import { FieldFactDefinitionId } from '../../../domain/valueObject/FieldFactDefinitionId/FieldFactDefinitionId'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'
import { TodoStatus } from '../../../domain/valueObject/TodoStatus/TodoStatus'
import { ExtractedFieldId } from '../../../domain/valueObject/ExtractedFieldId/ExtractedFieldId'
import { ExtractedFieldSource } from '../../../domain/valueObject/ExtractedFieldSource/ExtractedFieldSource'
import { ConsentLogId } from '../../../domain/valueObject/ConsentLogId/ConsentLogId'
import { ConsentType } from '../../../domain/valueObject/ConsentType/ConsentType'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ChatSessionType } from '../../../domain/valueObject/ChatSessionType/ChatSessionType'
import { ChatSessionStatus } from '../../../domain/valueObject/ChatSessionStatus/ChatSessionStatus'
import { ChatMessageId } from '../../../domain/valueObject/ChatMessageId/ChatMessageId'
import { ChatMessageRole } from '../../../domain/valueObject/ChatMessageRole/ChatMessageRole'
import { AgentType } from '../../../domain/valueObject/AgentType/AgentType'

describe('DrizzleApplicationRepository', () => {
  let db: Database
  let repo: DrizzleApplicationRepository
  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'

  beforeAll(() => {
    db = createTestDatabase()
    repo = new DrizzleApplicationRepository(db)
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    const now = new Date()
    await db.insert(job).values({
      id: jobIdVal,
      title: 'Test Job',
      status: 'draft',
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
      status: 'draft',
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

  describe('save / findById', () => {
    it('should save and retrieve an application', async () => {
      const app = createApplication()
      const saveResult = await repo.save(app)
      expect(saveResult.success).toBe(true)

      const findResult = await repo.findById(app.id)
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.id.value).toBe('app-1')
        expect(findResult.value.applicantName).toBe('Test Applicant')
        expect(findResult.value.status.value).toBe('new')
      }
    })

    it('should upsert on save', async () => {
      const app = createApplication()
      await repo.save(app)

      const updated = Application.reconstruct({
        id: app.id,
        jobId: app.jobId,
        schemaVersionId: app.schemaVersionId,
        applicantName: 'Updated Name',
        applicantEmail: app.applicantEmail,
        language: app.language,
        country: app.country,
        timezone: app.timezone,
        status: app.status,
        meetLink: app.meetLink,
        extractionReviewedAt: app.extractionReviewedAt,
        consentCheckedAt: app.consentCheckedAt,
        submittedAt: app.submittedAt,
        createdAt: app.createdAt,
        updatedAt: new Date(),
      })
      await repo.save(updated)

      const findResult = await repo.findById(app.id)
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.applicantName).toBe('Updated Name')
      }
    })

    it('should return error for non-existent application', async () => {
      const result = await repo.findById(ApplicationId.fromString('non-existent'))
      expect(result.success).toBe(false)
    })
  })

  describe('findByJobId', () => {
    it('should return applications by job id', async () => {
      await repo.save(createApplication('app-1'))
      await repo.save(createApplication('app-2'))

      const result = await repo.findByJobId(JobId.fromString(jobIdVal))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(2)
      }
    })
  })

  describe('findByJobIdAndStatus', () => {
    it('should filter by job id and status', async () => {
      await repo.save(createApplication('app-1'))

      const result = await repo.findByJobIdAndStatus(
        JobId.fromString(jobIdVal),
        ApplicationStatus.new()
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
      }

      const emptyResult = await repo.findByJobIdAndStatus(
        JobId.fromString(jobIdVal),
        ApplicationStatus.closed()
      )
      expect(emptyResult.success).toBe(true)
      if (emptyResult.success) {
        expect(emptyResult.value).toHaveLength(0)
      }
    })
  })

  describe('delete', () => {
    it('should delete an application', async () => {
      const app = createApplication()
      await repo.save(app)
      await repo.delete(app.id)

      const result = await repo.findById(app.id)
      expect(result.success).toBe(false)
    })
  })

  describe('ApplicationTodo', () => {
    it('should save and find todos', async () => {
      const app = createApplication()
      await repo.save(app)

      const todo = ApplicationTodo.reconstruct({
        id: ApplicationTodoId.fromString('todo-1'),
        applicationId: app.id,
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
      const saveResult = await repo.saveTodo(todo)
      expect(saveResult.success).toBe(true)

      const result = await repo.findTodosByApplicationId(app.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].fact).toBe('Full name')
      }
    })

    it('should save multiple todos', async () => {
      const app = createApplication()
      await repo.save(app)

      const todos = [
        ApplicationTodo.reconstruct({
          id: ApplicationTodoId.fromString('todo-1'),
          applicationId: app.id,
          fieldFactDefinitionId: FieldFactDefinitionId.fromString(ffdId),
          jobFormFieldId: JobFormFieldId.fromString(fieldId),
          fact: 'Fact 1',
          doneCriteria: 'Criteria 1',
          required: true,
          status: TodoStatus.pending(),
          extractedValue: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        ApplicationTodo.reconstruct({
          id: ApplicationTodoId.fromString('todo-2'),
          applicationId: app.id,
          fieldFactDefinitionId: FieldFactDefinitionId.fromString(ffdId),
          jobFormFieldId: JobFormFieldId.fromString(fieldId),
          fact: 'Fact 2',
          doneCriteria: 'Criteria 2',
          required: false,
          status: TodoStatus.pending(),
          extractedValue: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]
      await repo.saveTodos(todos)

      const result = await repo.findTodosByApplicationId(app.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(2)
      }
    })
  })

  describe('ExtractedField', () => {
    it('should save and find extracted fields', async () => {
      const app = createApplication()
      await repo.save(app)

      const field = ExtractedField.reconstruct({
        id: ExtractedFieldId.fromString('ef-1'),
        applicationId: app.id,
        jobFormFieldId: JobFormFieldId.fromString(fieldId),
        value: 'John Doe',
        source: ExtractedFieldSource.llm(),
        confirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await repo.saveExtractedField(field)

      const result = await repo.findExtractedFieldsByApplicationId(app.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].value).toBe('John Doe')
        expect(result.value[0].source.value).toBe('llm')
      }
    })
  })

  describe('ConsentLog', () => {
    it('should save and find consent logs (append-only)', async () => {
      const app = createApplication()
      await repo.save(app)

      const log = ConsentLog.reconstruct({
        id: ConsentLogId.fromString('cl-1'),
        applicationId: app.id,
        consentType: ConsentType.dataUsage(),
        consented: true,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        createdAt: new Date(),
      })
      await repo.saveConsentLog(log)

      const result = await repo.findConsentLogsByApplicationId(app.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].consentType.value).toBe('data_usage')
        expect(result.value[0].consented).toBe(true)
      }
    })
  })

  describe('ChatSession', () => {
    it('should save and find chat sessions', async () => {
      const app = createApplication()
      await repo.save(app)

      const session = ChatSession.reconstruct({
        id: ChatSessionId.fromString('cs-1'),
        applicationId: app.id,
        jobId: null,
        policyVersionId: null,
        type: ChatSessionType.application(),
        conductorId: null,
        bootstrapCompleted: false,
        status: ChatSessionStatus.active(),
        turnCount: 0,
        softCap: null,
        hardCap: null,
        softCappedAt: null,
        hardCappedAt: null,
        reviewFailStreak: 0,
        extractionFailStreak: 0,
        timeoutStreak: 0,
        currentAgent: AgentType.greeter(),
        plan: null,
        planSchemaVersion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await repo.saveChatSession(session)

      const result = await repo.findChatSessionsByApplicationId(app.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].type.value).toBe('application')
        expect(result.value[0].status.value).toBe('active')
      }
    })
  })

  describe('ChatMessage', () => {
    it('should save and find chat messages (append-only)', async () => {
      const app = createApplication()
      await repo.save(app)

      const session = ChatSession.reconstruct({
        id: ChatSessionId.fromString('cs-1'),
        applicationId: app.id,
        jobId: null,
        policyVersionId: null,
        type: ChatSessionType.application(),
        conductorId: null,
        bootstrapCompleted: false,
        status: ChatSessionStatus.active(),
        turnCount: 0,
        softCap: null,
        hardCap: null,
        softCappedAt: null,
        hardCappedAt: null,
        reviewFailStreak: 0,
        extractionFailStreak: 0,
        timeoutStreak: 0,
        currentAgent: AgentType.greeter(),
        plan: null,
        planSchemaVersion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await repo.saveChatSession(session)

      const message = ChatMessage.reconstruct({
        id: ChatMessageId.fromString('cm-1'),
        chatSessionId: session.id,
        role: ChatMessageRole.user(),
        content: 'Hello',
        targetJobFormFieldId: null,
        targetReviewSignalId: null,
        reviewPassed: null,
        createdAt: new Date(),
      })
      await repo.saveChatMessage(message)

      const result = await repo.findChatMessagesBySessionId(session.id)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].content).toBe('Hello')
        expect(result.value[0].role.value).toBe('user')
      }
    })
  })
})
