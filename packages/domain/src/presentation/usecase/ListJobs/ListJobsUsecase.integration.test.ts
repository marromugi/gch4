import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { ListJobsUsecase } from './ListJobsUsecase'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'

describe('ListJobsUsecase (integration)', () => {
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

  const createJob = (id: string) =>
    Job.reconstruct({
      id: JobId.fromString(id),
      title: `Job ${id}`,
      description: null,
      idealCandidate: null,
      cultureContext: null,
      status: JobStatus.draft(),
      createdBy: UserId.fromString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  describe('正常系', () => {
    it('ユーザーのJob一覧を取得できる', async () => {
      await repo.save(createJob('job-1'))
      await repo.save(createJob('job-2'))
      await repo.save(createJob('job-3'))

      const usecase = new ListJobsUsecase({ jobRepository: repo })
      const result = await usecase.execute({ userId })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(3)
      }
    })

    it('Jobが無い場合は空配列を返す', async () => {
      const usecase = new ListJobsUsecase({ jobRepository: repo })
      const result = await usecase.execute({ userId })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('userIdが空の場合バリデーションエラー', async () => {
      const usecase = new ListJobsUsecase({ jobRepository: repo })
      const result = await usecase.execute({ userId: '' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.name).toBe('ListJobsValidationError')
      }
    })
  })
})
