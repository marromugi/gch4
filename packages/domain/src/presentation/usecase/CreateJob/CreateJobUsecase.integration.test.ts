import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { DrizzleJobRepository } from '../../../infrastructure/repository/DrizzleJobRepository'
import { CreateJobUsecase } from './CreateJobUsecase'

describe('CreateJobUsecase (integration)', () => {
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

  let idCounter = 0
  const generateId = () => `generated-id-${++idCounter}`

  beforeEach(() => {
    idCounter = 0
  })

  describe('正常系', () => {
    it('Jobを作成できる（フォームフィールドなし）', async () => {
      const usecase = new CreateJobUsecase({ jobRepository: repo, generateId })

      const result = await usecase.execute({
        title: 'Software Engineer',
        idealCandidate: 'Experienced developer',
        cultureContext: 'Remote first',
        userId,
        formFields: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.title).toBe('Software Engineer')
        expect(result.value.idealCandidate).toBe('Experienced developer')
        expect(result.value.cultureContext).toBe('Remote first')
        expect(result.value.status.value).toBe('draft')
        expect(result.value.createdBy.value).toBe(userId)
      }
    })

    it('Jobをフォームフィールド付きで作成できる', async () => {
      const usecase = new CreateJobUsecase({ jobRepository: repo, generateId })

      const result = await usecase.execute({
        title: 'Designer',
        idealCandidate: null,
        cultureContext: null,
        userId,
        formFields: [
          { label: 'Name', intent: 'Collect name', required: true },
          { label: 'Portfolio', intent: null, required: false },
        ],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        const jobId = result.value.id
        const fieldsResult = await repo.findFormFieldsByJobId(jobId)
        expect(fieldsResult.success).toBe(true)
        if (fieldsResult.success) {
          expect(fieldsResult.value).toHaveLength(2)
          expect(fieldsResult.value[0].label).toBe('Name')
          expect(fieldsResult.value[1].label).toBe('Portfolio')
        }
      }
    })

    it('作成時にdraftのSchemaVersionが自動生成される', async () => {
      const usecase = new CreateJobUsecase({ jobRepository: repo, generateId })

      const result = await usecase.execute({
        title: 'PM',
        idealCandidate: null,
        cultureContext: null,
        userId,
        formFields: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        const svResult = await repo.findLatestSchemaVersion(result.value.id)
        expect(svResult.success).toBe(true)
        if (svResult.success) {
          expect(svResult.value).not.toBeNull()
          expect(svResult.value!.version).toBe(1)
          expect(svResult.value!.status.value).toBe('draft')
        }
      }
    })

    it('DBからJobを取得できる', async () => {
      const usecase = new CreateJobUsecase({ jobRepository: repo, generateId })

      const result = await usecase.execute({
        title: 'Backend Engineer',
        idealCandidate: null,
        cultureContext: null,
        userId,
        formFields: [],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        const findResult = await repo.findById(result.value.id)
        expect(findResult.success).toBe(true)
        if (findResult.success) {
          expect(findResult.value.title).toBe('Backend Engineer')
        }
      }
    })
  })

  describe('異常系', () => {
    it('titleが空の場合バリデーションエラー', async () => {
      const usecase = new CreateJobUsecase({ jobRepository: repo, generateId })

      const result = await usecase.execute({
        title: '',
        idealCandidate: null,
        cultureContext: null,
        userId,
        formFields: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.name).toBe('CreateJobValidationError')
      }
    })

    it('userIdが空の場合バリデーションエラー', async () => {
      const usecase = new CreateJobUsecase({ jobRepository: repo, generateId })

      const result = await usecase.execute({
        title: 'Valid Title',
        idealCandidate: null,
        cultureContext: null,
        userId: '',
        formFields: [],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.name).toBe('CreateJobValidationError')
      }
    })

    it('フォームフィールドのlabelが空の場合バリデーションエラー', async () => {
      const usecase = new CreateJobUsecase({ jobRepository: repo, generateId })

      const result = await usecase.execute({
        title: 'Valid Title',
        idealCandidate: null,
        cultureContext: null,
        userId,
        formFields: [{ label: '', intent: null, required: true }],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.name).toBe('CreateJobValidationError')
      }
    })
  })
})
