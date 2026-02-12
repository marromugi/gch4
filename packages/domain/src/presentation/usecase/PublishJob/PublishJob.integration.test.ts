import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { PublishJob } from './PublishJob'
import { Job } from '../../../domain/entity/Job/Job'
import { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobSchemaVersionStatus } from '../../../domain/valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'

describe('PublishJob (integration)', () => {
  let db: Database
  let repo: DrizzleJobRepository
  const userId = 'test-user-1'

  beforeAll(() => {
    db = createTestDatabase()
    repo = new DrizzleJobRepository(db)
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
  })

  const createDraftJob = (id = 'job-1') =>
    Job.reconstruct({
      id: JobId.fromString(id),
      title: 'Test Job',
      description: null,
      idealCandidate: null,
      cultureContext: null,
      status: JobStatus.draft(),
      createdBy: UserId.fromString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  const createApprovedSchema = (jobId: string, svId = 'sv-1') =>
    JobSchemaVersion.reconstruct({
      id: JobSchemaVersionId.fromString(svId),
      jobId: JobId.fromString(jobId),
      version: 1,
      status: JobSchemaVersionStatus.approved(),
      approvedAt: new Date(),
      createdAt: new Date(),
    })

  const createDraftSchema = (jobId: string, svId = 'sv-1') =>
    JobSchemaVersion.reconstruct({
      id: JobSchemaVersionId.fromString(svId),
      jobId: JobId.fromString(jobId),
      version: 1,
      status: JobSchemaVersionStatus.draft(),
      approvedAt: null,
      createdAt: new Date(),
    })

  describe('正常系', () => {
    it('draftのJobをpublishしてopenにできる', async () => {
      const job = createDraftJob('job-1')
      await repo.save(job)
      await repo.saveSchemaVersion(createApprovedSchema('job-1'))

      const usecase = new PublishJob(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.job.status.value).toBe('open')
      }

      const findResult = await repo.findById(JobId.fromString('job-1'))
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.status.value).toBe('open')
      }
    })
  })

  describe('異常系', () => {
    it('SchemaVersionが未承認の場合エラー', async () => {
      const job = createDraftJob('job-1')
      await repo.save(job)
      await repo.saveSchemaVersion(createDraftSchema('job-1'))

      const usecase = new PublishJob(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('approved')
      }
    })

    it('SchemaVersionが存在しない場合エラー', async () => {
      const job = createDraftJob('job-1')
      await repo.save(job)

      const usecase = new PublishJob(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('No schema version')
      }
    })

    it('存在しないJobの場合エラー', async () => {
      const usecase = new PublishJob(repo)
      const result = await usecase.execute({ jobId: 'non-existent' })

      expect(result.success).toBe(false)
    })
  })
})
