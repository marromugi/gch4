import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { RecordEventLogUsecase } from './RecordEventLogUsecase'
import {
  RecordEventLogValidationError,
  RecordEventLogRepositoryError,
} from './RecordEventLogUsecase'
import type { RecordEventLogDeps } from './RecordEventLogUsecase'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'

describe('RecordEventLogUsecase', () => {
  const createDeps = (overrides?: Partial<IEventLogRepository>): RecordEventLogDeps => ({
    eventLogRepository: {
      create: vi.fn().mockResolvedValue(Result.ok(undefined)),
      ...overrides,
    } as unknown as IEventLogRepository,
  })

  describe('正常系', () => {
    it('EventLog を記録できる', async () => {
      const deps = createDeps()
      const usecase = new RecordEventLogUsecase(deps)

      const result = await usecase.execute({
        eventLogId: 'el-1',
        eventType: 'chat_started',
        submissionId: 'sub-1',
        formId: 'form-1',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.eventType.value).toBe('chat_started')
        expect(result.value.submissionId?.value).toBe('sub-1')
        expect(result.value.formId?.value).toBe('form-1')
      }
    })

    it('オプションフィールド無しで EventLog を記録できる', async () => {
      const deps = createDeps()
      const usecase = new RecordEventLogUsecase(deps)

      const result = await usecase.execute({
        eventLogId: 'el-2',
        eventType: 'submission_submitted',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.submissionId).toBeNull()
        expect(result.value.formId).toBeNull()
        expect(result.value.chatSessionId).toBeNull()
        expect(result.value.metadata).toBeNull()
      }
    })

    it('metadata 付きで EventLog を記録できる', async () => {
      const deps = createDeps()
      const usecase = new RecordEventLogUsecase(deps)

      const result = await usecase.execute({
        eventLogId: 'el-3',
        eventType: 'manual_fallback_triggered',
        metadata: '{"reason":"timeout"}',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.metadata).toBe('{"reason":"timeout"}')
      }
    })
  })

  describe('異常系', () => {
    it('不正な eventType でバリデーションエラーを返す', async () => {
      const deps = createDeps()
      const usecase = new RecordEventLogUsecase(deps)

      const result = await usecase.execute({
        eventLogId: 'el-1',
        eventType: 'invalid_event',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(RecordEventLogValidationError)
      }
    })

    it('リポジトリ保存失敗でリポジトリエラーを返す', async () => {
      const deps = createDeps({
        create: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new RecordEventLogUsecase(deps)

      const result = await usecase.execute({
        eventLogId: 'el-1',
        eventType: 'chat_started',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(RecordEventLogRepositoryError)
      }
    })
  })
})
