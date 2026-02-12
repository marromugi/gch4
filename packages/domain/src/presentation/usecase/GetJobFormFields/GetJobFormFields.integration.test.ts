import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { GetJobFormFields } from './GetJobFormFields'
import { Job } from '../../../domain/entity/Job/Job'
import { JobFormField } from '../../../domain/entity/JobFormField/JobFormField'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { JobStatus } from '../../../domain/valueObject/JobStatus/JobStatus'
import { JobFormFieldId } from '../../../domain/valueObject/JobFormFieldId/JobFormFieldId'

describe('GetJobFormFields (integration)', () => {
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
    it('Jobのフォームフィールド一覧を取得できる', async () => {
      const job = createJob('job-1')
      await repo.save(job)

      const fields = [
        JobFormField.reconstruct({
          id: JobFormFieldId.fromString('field-1'),
          jobId: job.id,
          fieldId: 'name',
          label: 'Name',
          intent: 'Collect name',
          required: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        JobFormField.reconstruct({
          id: JobFormFieldId.fromString('field-2'),
          jobId: job.id,
          fieldId: 'email',
          label: 'Email',
          intent: null,
          required: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]
      await repo.saveFormFields(fields)

      const usecase = new GetJobFormFields(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.fields).toHaveLength(2)
        const fieldIds = result.value.fields.map((f) => f.fieldId)
        expect(fieldIds).toContain('name')
        expect(fieldIds).toContain('email')
      }
    })

    it('フォームフィールドが無い場合は空配列を返す', async () => {
      const job = createJob('job-1')
      await repo.save(job)

      const usecase = new GetJobFormFields(repo)
      const result = await usecase.execute({ jobId: 'job-1' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.fields).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('存在しないJobの場合は空配列を返す', async () => {
      const usecase = new GetJobFormFields(repo)
      const result = await usecase.execute({ jobId: 'non-existent' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.fields).toHaveLength(0)
      }
    })
  })
})
