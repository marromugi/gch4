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
  application as applicationTable,
  applicationTodo as applicationTodoTable,
} from '@ding/database/schema'
import { DrizzleApplicationRepository } from '../../../infrastructure/repository/DrizzleApplicationRepository'
import { DrizzleEventLogRepository } from '../../../infrastructure/repository/DrizzleEventLogRepository'
import { FallbackService } from '../../../domain/service/FallbackService/FallbackService'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { TriggerManualFallbackUsecase } from './TriggerManualFallbackUsecase'

describe('TriggerManualFallbackUsecase', () => {
  let db: Database
  let usecase: TriggerManualFallbackUsecase
  let applicationRepository: DrizzleApplicationRepository
  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'
  const svId = 'test-sv-1'
  const fieldId = 'test-field-1'
  const ffdId = 'test-ffd-1'
  const appId = 'test-app-1'
  const todoId1 = 'test-todo-1'
  const todoId2 = 'test-todo-2'

  beforeAll(() => {
    db = createTestDatabase()
    applicationRepository = new DrizzleApplicationRepository(db)
    const eventLogRepository = new DrizzleEventLogRepository(db)
    const fallbackService = new FallbackService()
    usecase = new TriggerManualFallbackUsecase({
      applicationRepository,
      eventLogRepository,
      fallbackService,
    })
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
    await db.insert(applicationTable).values({
      id: appId,
      jobId: jobIdVal,
      schemaVersionId: svId,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    })
    // Todoシードデータ: pendingとawaiting_answerの2つ
    await db.insert(applicationTodoTable).values([
      {
        id: todoId1,
        applicationId: appId,
        fieldFactDefinitionId: ffdId,
        jobFormFieldId: fieldId,
        fact: 'Full name',
        doneCriteria: 'Name provided',
        required: true,
        status: 'pending',
        extractedValue: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: todoId2,
        applicationId: appId,
        fieldFactDefinitionId: ffdId,
        jobFormFieldId: fieldId,
        fact: 'Full name detail',
        doneCriteria: 'Detail provided',
        required: false,
        status: 'awaiting_answer',
        extractedValue: null,
        createdAt: now,
        updatedAt: now,
      },
    ])
  })

  describe('正常系', () => {
    it('未完了のTodoをmanual_inputに遷移し、イベントログを記録する', async () => {
      const result = await usecase.execute({
        applicationId: appId,
        eventLogId: 'evt-fallback-1',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.id.value).toBe(appId)
      }

      // Todoがmanual_inputになっていることを確認
      const todosResult = await applicationRepository.findTodosByApplicationId(
        ApplicationId.fromString(appId)
      )
      expect(todosResult.success).toBe(true)
      if (todosResult.success) {
        for (const todo of todosResult.value) {
          expect(todo.status.value).toBe('manual_input')
        }
      }
    })

    it('doneステータスのTodoはそのまま残る', async () => {
      // todoId1をdoneに更新
      const now = new Date()
      await db.delete(applicationTodoTable)
      await db.insert(applicationTodoTable).values([
        {
          id: todoId1,
          applicationId: appId,
          fieldFactDefinitionId: ffdId,
          jobFormFieldId: fieldId,
          fact: 'Full name',
          doneCriteria: 'Name provided',
          required: true,
          status: 'done',
          extractedValue: 'John Doe',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: todoId2,
          applicationId: appId,
          fieldFactDefinitionId: ffdId,
          jobFormFieldId: fieldId,
          fact: 'Full name detail',
          doneCriteria: 'Detail provided',
          required: false,
          status: 'pending',
          extractedValue: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      const result = await usecase.execute({
        applicationId: appId,
        eventLogId: 'evt-fallback-2',
      })

      expect(result.success).toBe(true)

      const todosResult = await applicationRepository.findTodosByApplicationId(
        ApplicationId.fromString(appId)
      )
      expect(todosResult.success).toBe(true)
      if (todosResult.success) {
        const doneTodo = todosResult.value.find((t) => t.id.value === todoId1)
        const pendingTodo = todosResult.value.find((t) => t.id.value === todoId2)
        expect(doneTodo!.status.value).toBe('done')
        expect(pendingTodo!.status.value).toBe('manual_input')
      }
    })
  })

  describe('異常系', () => {
    it('存在しないApplicationIdの場合エラーを返す', async () => {
      const result = await usecase.execute({
        applicationId: 'non-existent-app',
        eventLogId: 'evt-fallback-err',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('not found')
      }
    })
  })
})
