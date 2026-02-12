import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { job } from '@ding/database/schema'
import { DrizzleEventLogRepository } from './DrizzleEventLogRepository'
import { EventLog } from '../../../domain/entity/EventLog/EventLog'
import { EventLogId } from '../../../domain/valueObject/EventLogId/EventLogId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { EventType } from '../../../domain/valueObject/EventType/EventType'

describe('DrizzleEventLogRepository', () => {
  let db: Database
  let repo: DrizzleEventLogRepository
  const userId = 'test-user-1'
  const jobId = 'test-job-1'

  beforeAll(() => {
    db = createTestDatabase()
    repo = new DrizzleEventLogRepository(db)
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    await db.insert(job).values({
      id: jobId,
      title: 'Test Job',
      status: 'draft',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  const createEventLog = (id = 'el-1') =>
    EventLog.reconstruct({
      id: EventLogId.fromString(id),
      jobId: JobId.fromString(jobId),
      applicationId: null,
      chatSessionId: null,
      policyVersionId: null,
      eventType: EventType.chatStarted(),
      metadata: null,
      createdAt: new Date(),
    })

  describe('create / findByJobId', () => {
    it('should create and find event logs by job id', async () => {
      const log = createEventLog()
      const createResult = await repo.create(log)
      expect(createResult.success).toBe(true)

      const findResult = await repo.findByJobId(JobId.fromString(jobId))
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value).toHaveLength(1)
        expect(findResult.value[0].eventType.value).toBe('chat_started')
      }
    })

    it('should create multiple event logs', async () => {
      await repo.create(createEventLog('el-1'))
      await repo.create(
        EventLog.reconstruct({
          id: EventLogId.fromString('el-2'),
          jobId: JobId.fromString(jobId),
          applicationId: null,
          chatSessionId: null,
          policyVersionId: null,
          eventType: EventType.extractionReviewed(),
          metadata: '{"key":"value"}',
          createdAt: new Date(),
        })
      )

      const result = await repo.findByJobId(JobId.fromString(jobId))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(2)
      }
    })
  })

  describe('findByApplicationId', () => {
    it('should return empty array when no matching logs', async () => {
      const result = await repo.findByApplicationId(ApplicationId.fromString('non-existent'))
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(0)
      }
    })
  })
})
