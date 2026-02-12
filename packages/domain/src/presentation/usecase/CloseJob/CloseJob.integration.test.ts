import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { CloseJob } from './CloseJob'
import type { Database } from '@ding/database/client'

describe('CloseJob (integration)', () => {
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

  const createOpenJob = (id = 'job-1') =>
    Job.reconstruct({
      id: JobId.fromString(id),
      title: 'Test Job',
      description: null,
      idealCandidate: null,
      cultureContext: null,
      status: JobStatus.open(),
      createdBy: UserId.fromString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  describe('正常系', () => {
    it('openのJobをcloseできる', async () => {
      const job = createOpenJob('job-1')
      await repo.save(job)

      const usecase = new CloseJob(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.job.status.value).toBe('closed')
      }

      const findResult = await repo.findById(JobId.fromString('job-1'))
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.status.value).toBe('closed')
      }
    })
  })

  describe('異常系', () => {
    it('draftのJobをcloseしようとするとエラー', async () => {
      const draftJob = Job.reconstruct({
        id: JobId.fromString('job-1'),
        title: 'Draft Job',
        description: null,
        idealCandidate: null,
        cultureContext: null,
        status: JobStatus.draft(),
        createdBy: UserId.fromString(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await repo.save(draftJob)

      const usecase = new CloseJob(repo)

      await expect(usecase.execute({ jobId: 'job-1' })).rejects.toThrow()
    })

    it('存在しないJobの場合エラー', async () => {
      const usecase = new CloseJob(repo)
      const result = await usecase.execute({ jobId: 'non-existent' })

      expect(result.success).toBe(false)
    })
  })
})
