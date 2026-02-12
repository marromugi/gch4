import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { SaveJobFormFields } from './SaveJobFormFields'
import { Job } from '../../../domain/entity/Job/Job'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'

describe('SaveJobFormFields (integration)', () => {
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

  describe('正常系', () => {
    it('フォームフィールドを保存できる', async () => {
      const job = createJob('job-1')
      await repo.save(job)

      const usecase = new SaveJobFormFields(repo)
      const result = await usecase.execute({
        jobId: 'job-1',
        fields: [
          {
            id: 'field-1',
            fieldId: 'name',
            label: 'Name',
            intent: 'Collect name',
            required: true,
            sortOrder: 0,
          },
          {
            id: 'field-2',
            fieldId: 'email',
            label: 'Email',
            intent: null,
            required: true,
            sortOrder: 1,
          },
        ],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.fields).toHaveLength(2)
        expect(result.value.fields[0].label).toBe('Name')
        expect(result.value.fields[1].label).toBe('Email')
      }

      const fieldsResult = await repo.findFormFieldsByJobId(JobId.fromString('job-1'))
      expect(fieldsResult.success).toBe(true)
      if (fieldsResult.success) {
        expect(fieldsResult.value).toHaveLength(2)
      }
    })

    it('空のフィールド配列を保存できる', async () => {
      const job = createJob('job-1')
      await repo.save(job)

      const usecase = new SaveJobFormFields(repo)
      const result = await usecase.execute({
        jobId: 'job-1',
        fields: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.fields).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('存在しないJobの場合エラー', async () => {
      const usecase = new SaveJobFormFields(repo)
      const result = await usecase.execute({
        jobId: 'non-existent',
        fields: [
          {
            id: 'field-1',
            fieldId: 'name',
            label: 'Name',
            intent: null,
            required: true,
            sortOrder: 0,
          },
        ],
      })

      expect(result.success).toBe(false)
    })
  })
})
