import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { GetJobUsecase } from './GetJobUsecase'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'

describe('GetJobUsecase (integration)', () => {
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
      description: 'A test job',
      idealCandidate: 'Ideal candidate',
      cultureContext: 'Culture context',
      status: JobStatus.draft(),
      createdBy: UserId.fromString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  describe('正常系', () => {
    it('IDでJobを取得できる', async () => {
      const job = createJob('job-1')
      await repo.save(job)

      const usecase = new GetJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.id.value).toBe('job-1')
        expect(result.value.title).toBe('Test Job')
      }
    })
  })

  describe('異常系', () => {
    it('存在しないJobIDの場合エラー', async () => {
      const usecase = new GetJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({ jobId: 'non-existent' })

      expect(result.success).toBe(false)
    })

    it('jobIdが空の場合バリデーションエラー', async () => {
      const usecase = new GetJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({ jobId: '' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.name).toBe('GetJobValidationError')
      }
    })
  })
})
