import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { UpdateJobUsecase } from './UpdateJobUsecase'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'

describe('UpdateJobUsecase (integration)', () => {
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
      title: 'Original Title',
      description: 'Description',
      idealCandidate: 'Original Ideal',
      cultureContext: 'Original Culture',
      status: JobStatus.draft(),
      createdBy: UserId.fromString(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  describe('正常系', () => {
    it('Jobのtitleを更新できる', async () => {
      const job = createJob()
      await repo.save(job)

      const usecase = new UpdateJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({
        jobId: 'job-1',
        title: 'Updated Title',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.title).toBe('Updated Title')
        expect(result.value.idealCandidate).toBe('Original Ideal')
      }

      const findResult = await repo.findById(JobId.fromString('job-1'))
      expect(findResult.success).toBe(true)
      if (findResult.success) {
        expect(findResult.value.title).toBe('Updated Title')
      }
    })

    it('idealCandidateとcultureContextを更新できる', async () => {
      const job = createJob()
      await repo.save(job)

      const usecase = new UpdateJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({
        jobId: 'job-1',
        idealCandidate: 'New Ideal',
        cultureContext: 'New Culture',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.idealCandidate).toBe('New Ideal')
        expect(result.value.cultureContext).toBe('New Culture')
        expect(result.value.title).toBe('Original Title')
      }
    })

    it('idealCandidateをnullに更新できる', async () => {
      const job = createJob()
      await repo.save(job)

      const usecase = new UpdateJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({
        jobId: 'job-1',
        idealCandidate: null,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.idealCandidate).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('jobIdが空の場合バリデーションエラー', async () => {
      const usecase = new UpdateJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({
        jobId: '',
        title: 'New Title',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.name).toBe('UpdateJobValidationError')
      }
    })

    it('titleが空文字の場合バリデーションエラー', async () => {
      const usecase = new UpdateJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({
        jobId: 'job-1',
        title: '',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.name).toBe('UpdateJobValidationError')
      }
    })

    it('存在しないJobの場合エラー', async () => {
      const usecase = new UpdateJobUsecase({ jobRepository: repo })
      const result = await usecase.execute({
        jobId: 'non-existent',
        title: 'New Title',
      })

      expect(result.success).toBe(false)
    })
  })
})
