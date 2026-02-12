import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { SaveInterviewFeedbackUsecase } from './SaveInterviewFeedbackUsecase'
import type {
  SaveInterviewFeedbackDeps,
  SaveInterviewFeedbackInput,
} from './SaveInterviewFeedbackUsecase'
import type { IInterviewFeedbackRepository } from '../../../domain/repository/IInterviewFeedbackRepository/IInterviewFeedbackRepository'

const createMockDeps = (
  overrides?: Partial<IInterviewFeedbackRepository>
): SaveInterviewFeedbackDeps => ({
  interviewFeedbackRepository: {
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
    findById: vi.fn(),
    findByApplicationId: vi.fn(),
    ...overrides,
  } as unknown as IInterviewFeedbackRepository,
})

const validInput: SaveInterviewFeedbackInput = {
  id: 'feedback-1',
  applicationId: 'app-1',
  chatSessionId: 'session-1',
  policyVersionId: 'policy-1',
  structuredData: JSON.stringify({ evidenceFacts: [], interpretations: [] }),
  structuredSchemaVersion: 1,
}

describe('SaveInterviewFeedbackUsecase', () => {
  describe('正常系', () => {
    it('面談後フィードバックを保存できる', async () => {
      const deps = createMockDeps()
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.id.value).toBe('feedback-1')
        expect(result.value.applicationId.value).toBe('app-1')
        expect(result.value.chatSessionId.value).toBe('session-1')
        expect(result.value.policyVersionId.value).toBe('policy-1')
      }
    })

    it('structuredDataがnullでも保存できる', async () => {
      const deps = createMockDeps()
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({
        ...validInput,
        structuredData: null,
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.structuredData).toBeNull()
      }
    })

    it('リポジトリのsaveが呼ばれる', async () => {
      const deps = createMockDeps()
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      await usecase.execute(validInput)

      expect(deps.interviewFeedbackRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('異常系', () => {
    it('idが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ ...validInput, id: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('applicationIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ ...validInput, applicationId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('chatSessionIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ ...validInput, chatSessionId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('policyVersionIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ ...validInput, policyVersionId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('リポジトリのsaveが失敗した場合save_error', async () => {
      const deps = createMockDeps({
        save: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new SaveInterviewFeedbackUsecase(deps)

      const result = await usecase.execute(validInput)

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('save_error')
      }
    })
  })
})
