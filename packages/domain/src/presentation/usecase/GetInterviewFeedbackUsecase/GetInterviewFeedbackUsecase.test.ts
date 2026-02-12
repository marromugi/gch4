import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { GetInterviewFeedbackUsecase } from './GetInterviewFeedbackUsecase'
import type { GetInterviewFeedbackDeps } from './GetInterviewFeedbackUsecase'
import { InterviewFeedback } from '../../../domain/entity/InterviewFeedback/InterviewFeedback'
import { InterviewFeedbackId } from '../../../domain/valueObject/InterviewFeedbackId/InterviewFeedbackId'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { IInterviewFeedbackRepository } from '../../../domain/repository/IInterviewFeedbackRepository/IInterviewFeedbackRepository'

const now = new Date()

const createFeedback = (id: string) =>
  InterviewFeedback.reconstruct({
    id: InterviewFeedbackId.fromString(id),
    applicationId: ApplicationId.fromString('app-1'),
    chatSessionId: ChatSessionId.fromString('session-1'),
    policyVersionId: ReviewPolicyVersionId.fromString('policy-1'),
    structuredData: null,
    structuredSchemaVersion: 1,
    summaryConfirmedAt: null,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  })

const createMockDeps = (
  overrides?: Partial<IInterviewFeedbackRepository>
): GetInterviewFeedbackDeps => ({
  interviewFeedbackRepository: {
    findByApplicationId: vi
      .fn()
      .mockResolvedValue(Result.ok([createFeedback('fb-1'), createFeedback('fb-2')])),
    findById: vi.fn(),
    save: vi.fn(),
    ...overrides,
  } as unknown as IInterviewFeedbackRepository,
})

describe('GetInterviewFeedbackUsecase', () => {
  describe('正常系', () => {
    it('applicationIdでフィードバックを取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new GetInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result) && result.value !== null) {
        expect(result.value).toHaveLength(2)
        expect(result.value[0].id.value).toBe('fb-1')
      }
    })

    it('フィードバックが存在しない場合nullを返す', async () => {
      const deps = createMockDeps({
        findByApplicationId: vi.fn().mockResolvedValue(Result.ok([])),
      })
      const usecase = new GetInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-nonexistent' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('applicationIdが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new GetInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ applicationId: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('リポジトリのfindByApplicationIdが失敗した場合fetch_error', async () => {
      const deps = createMockDeps({
        findByApplicationId: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new GetInterviewFeedbackUsecase(deps)

      const result = await usecase.execute({ applicationId: 'app-1' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error.type).toBe('fetch_error')
      }
    })
  })
})
