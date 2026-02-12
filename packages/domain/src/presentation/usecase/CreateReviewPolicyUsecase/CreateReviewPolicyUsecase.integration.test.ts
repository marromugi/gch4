import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import type { Database } from '@ding/database/client'
import {
  createTestDatabase,
  cleanDatabase,
  insertTestUser,
} from '../../../__tests__/helpers/test-database'
import { job } from '@ding/database/schema'
import { DrizzleReviewPolicyRepository } from '../../../infrastructure/repository/DrizzleReviewPolicyRepository'
import { CreateReviewPolicyUsecase } from './CreateReviewPolicyUsecase'
import type { CreateReviewPolicyInput } from './CreateReviewPolicyUsecase'

describe('CreateReviewPolicyUsecase', () => {
  let db: Database
  let usecase: CreateReviewPolicyUsecase

  const userId = 'test-user-1'
  const jobIdVal = 'test-job-1'

  beforeAll(() => {
    db = createTestDatabase()
    const repo = new DrizzleReviewPolicyRepository(db)
    usecase = new CreateReviewPolicyUsecase({ reviewPolicyRepository: repo })
  })

  beforeEach(async () => {
    await cleanDatabase(db)
    await insertTestUser(db, { id: userId })
    const now = new Date()
    await db.insert(job).values({
      id: jobIdVal,
      title: 'Test Job',
      status: 'draft',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
  })

  describe('正常系', () => {
    it('シグナルと禁止トピック付きでレビュー方針を作成できる', async () => {
      const input: CreateReviewPolicyInput = {
        id: 'rpv-1',
        jobId: jobIdVal,
        createdBy: userId,
        softCap: 6,
        hardCap: 10,
        signals: [
          {
            label: 'Communication Skills',
            description: 'Evaluates communication ability',
            priority: 'high',
            category: 'must',
          },
          {
            label: 'Technical Skills',
            description: null,
            priority: 'supporting',
            category: 'nice',
          },
        ],
        prohibitedTopics: [{ topic: 'Salary negotiation' }],
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.policy.id.value).toBe('rpv-1')
        expect(result.value.policy.status.isDraft()).toBe(true)
        expect(result.value.policy.softCap).toBe(6)
        expect(result.value.policy.hardCap).toBe(10)
        expect(result.value.signals).toHaveLength(2)
        expect(result.value.signals[0].label).toBe('Communication Skills')
        expect(result.value.signals[1].label).toBe('Technical Skills')
        expect(result.value.prohibitedTopics).toHaveLength(1)
        expect(result.value.prohibitedTopics[0].topic).toBe('Salary negotiation')
      }
    })

    it('禁止トピックなしでレビュー方針を作成できる', async () => {
      const input: CreateReviewPolicyInput = {
        id: 'rpv-2',
        jobId: jobIdVal,
        createdBy: userId,
        softCap: 4,
        hardCap: 8,
        signals: [
          {
            label: 'Problem Solving',
            description: 'Analytical thinking',
            priority: 'high',
            category: 'must',
          },
        ],
        prohibitedTopics: [],
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.policy.id.value).toBe('rpv-2')
        expect(result.value.signals).toHaveLength(1)
        expect(result.value.prohibitedTopics).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('idが空の場合バリデーションエラーになる', async () => {
      const input: CreateReviewPolicyInput = {
        id: '',
        jobId: jobIdVal,
        createdBy: userId,
        softCap: 6,
        hardCap: 10,
        signals: [{ label: 'Skill', description: null, priority: 'high', category: 'must' }],
        prohibitedTopics: [],
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('id is required')
      }
    })

    it('signalsが空の場合バリデーションエラーになる', async () => {
      const input: CreateReviewPolicyInput = {
        id: 'rpv-3',
        jobId: jobIdVal,
        createdBy: userId,
        softCap: 6,
        hardCap: 10,
        signals: [],
        prohibitedTopics: [],
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('At least one signal is required')
      }
    })

    it('signalのlabelが空の場合バリデーションエラーになる', async () => {
      const input: CreateReviewPolicyInput = {
        id: 'rpv-4',
        jobId: jobIdVal,
        createdBy: userId,
        softCap: 6,
        hardCap: 10,
        signals: [{ label: '', description: null, priority: 'high', category: 'must' }],
        prohibitedTopics: [],
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('Signal label is required')
      }
    })

    it('prohibitedTopicのtopicが空の場合バリデーションエラーになる', async () => {
      const input: CreateReviewPolicyInput = {
        id: 'rpv-5',
        jobId: jobIdVal,
        createdBy: userId,
        softCap: 6,
        hardCap: 10,
        signals: [{ label: 'Skill', description: null, priority: 'high', category: 'must' }],
        prohibitedTopics: [{ topic: '' }],
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('Prohibited topic is required')
      }
    })

    it('複数のバリデーションエラーが同時に返る', async () => {
      const input: CreateReviewPolicyInput = {
        id: '',
        jobId: '',
        createdBy: '',
        softCap: 6,
        hardCap: 10,
        signals: [],
        prohibitedTopics: [],
      }

      const result = await usecase.execute(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('validation_error')
        expect(result.error.message).toContain('id is required')
        expect(result.error.message).toContain('jobId is required')
        expect(result.error.message).toContain('createdBy is required')
        expect(result.error.message).toContain('At least one signal is required')
      }
    })
  })
})
