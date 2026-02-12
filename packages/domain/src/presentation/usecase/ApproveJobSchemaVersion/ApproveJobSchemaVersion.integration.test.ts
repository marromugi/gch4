import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { ApproveJobSchemaVersion } from './ApproveJobSchemaVersion'
import { Job } from '../../../domain/entity/Job/Job'
import { JobSchemaVersion } from '../../../domain/entity/JobSchemaVersion/JobSchemaVersion'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobSchemaVersionStatus } from '../../../domain/valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'

describe('ApproveJobSchemaVersion (integration)', () => {
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

  const createJob = (id = 'job-1') =>
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

  const createDraftSchemaVersion = (jobId: string, svId = 'sv-1', version = 1) =>
    JobSchemaVersion.reconstruct({
      id: JobSchemaVersionId.fromString(svId),
      jobId: JobId.fromString(jobId),
      version,
      status: JobSchemaVersionStatus.draft(),
      approvedAt: null,
      createdAt: new Date(),
    })

  describe('正常系', () => {
    it('draftのSchemaVersionをapproveできる', async () => {
      const job = createJob('job-1')
      await repo.save(job)
      await repo.saveSchemaVersion(createDraftSchemaVersion('job-1', 'sv-1'))

      const usecase = new ApproveJobSchemaVersion(repo)
      const result = await usecase.execute({
        jobId: 'job-1',
        schemaVersionId: 'sv-1',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.schemaVersion.status.value).toBe('approved')
        expect(result.value.schemaVersion.approvedAt).not.toBeNull()
      }

      const svResult = await repo.findLatestSchemaVersion(JobId.fromString('job-1'))
      expect(svResult.success).toBe(true)
      if (svResult.success) {
        expect(svResult.value!.status.value).toBe('approved')
      }
    })
  })

  describe('異常系', () => {
    it('SchemaVersionが存在しない場合エラー', async () => {
      const job = createJob('job-1')
      await repo.save(job)

      const usecase = new ApproveJobSchemaVersion(repo)
      const result = await usecase.execute({
        jobId: 'job-1',
        schemaVersionId: 'sv-1',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('No schema version')
      }
    })

    it('schemaVersionIdが最新バージョンと一致しない場合エラー', async () => {
      const job = createJob('job-1')
      await repo.save(job)
      await repo.saveSchemaVersion(createDraftSchemaVersion('job-1', 'sv-1', 1))
      await repo.saveSchemaVersion(createDraftSchemaVersion('job-1', 'sv-2', 2))

      const usecase = new ApproveJobSchemaVersion(repo)
      const result = await usecase.execute({
        jobId: 'job-1',
        schemaVersionId: 'sv-1',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('mismatch')
      }
    })
  })
})
