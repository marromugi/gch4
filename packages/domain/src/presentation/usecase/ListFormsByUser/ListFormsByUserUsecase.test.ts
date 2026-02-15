import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import type { ISubmissionRepository } from '../../../domain/repository/ISubmissionRepository/ISubmissionRepository'
import {
  ListFormsByUserUsecase,
  ListFormsByUserRepositoryError,
  type ListFormsByUserDeps,
} from './ListFormsByUserUsecase'

const createMockForm = (overrides?: { id?: string; title?: string }): Form => {
  const now = new Date()
  return Form.create({
    id: FormId.fromString(overrides?.id ?? 'form-1'),
    title: overrides?.title ?? 'Test Form',
    description: null,
    purpose: null,
    completionMessage: null,
    status: FormStatus.draft(),
    createdBy: UserId.fromString('user-123'),
    createdAt: now,
    updatedAt: now,
  })
}

const createMockSubmissionRepository = (
  countByFormIdsResult: Map<string, number> = new Map()
): ISubmissionRepository =>
  ({
    countByFormIds: vi.fn().mockResolvedValue(Result.ok(countByFormIdsResult)),
    findById: vi.fn(),
    findByFormId: vi.fn(),
    findByFormIdAndStatus: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    findTasksBySubmissionId: vi.fn(),
    saveTask: vi.fn(),
    saveTasks: vi.fn(),
    findCollectedFieldById: vi.fn(),
    findCollectedFieldsBySubmissionId: vi.fn(),
    saveCollectedField: vi.fn(),
    saveCollectedFields: vi.fn(),
    findConsentLogsBySubmissionId: vi.fn(),
    saveConsentLog: vi.fn(),
    findChatSessionsBySubmissionId: vi.fn(),
    findChatSessionById: vi.fn(),
    saveChatSession: vi.fn(),
    findChatMessagesBySessionId: vi.fn(),
    saveChatMessage: vi.fn(),
  }) as ISubmissionRepository

const createMockDeps = (
  formRepositoryOverrides?: Partial<IFormRepository>,
  submissionCountMap?: Map<string, number>
): ListFormsByUserDeps => ({
  formRepository: {
    findByUserId: vi.fn().mockResolvedValue(Result.ok([])),
    save: vi.fn(),
    saveFormFields: vi.fn(),
    saveSchemaVersion: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    findFormFieldsByFormId: vi.fn(),
    saveFormField: vi.fn(),
    deleteFormFieldsByFormId: vi.fn(),
    findSchemaVersionById: vi.fn(),
    findSchemaVersionsByFormId: vi.fn(),
    findLatestSchemaVersionByFormId: vi.fn(),
    findCompletionCriteriaBySchemaVersionId: vi.fn(),
    saveCompletionCriteria: vi.fn(),
    ...formRepositoryOverrides,
  } as IFormRepository,
  submissionRepository: createMockSubmissionRepository(submissionCountMap),
})

describe('ListFormsByUserUsecase', () => {
  describe('正常系', () => {
    it('ユーザーのフォーム一覧と応募数を取得できる', async () => {
      const forms = [
        createMockForm({ id: 'form-1', title: 'Form 1' }),
        createMockForm({ id: 'form-2', title: 'Form 2' }),
      ]
      const countMap = new Map([
        ['form-1', 5],
        ['form-2', 10],
      ])
      const deps = createMockDeps(
        { findByUserId: vi.fn().mockResolvedValue(Result.ok(forms)) },
        countMap
      )
      const usecase = new ListFormsByUserUsecase(deps)

      const result = await usecase.execute({ userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(2)
        expect(result.value[0].form.title).toBe('Form 1')
        expect(result.value[0].submissionCount).toBe(5)
        expect(result.value[1].form.title).toBe('Form 2')
        expect(result.value[1].submissionCount).toBe(10)
      }
    })

    it('応募がないフォームはsubmissionCount=0を返す', async () => {
      const forms = [createMockForm({ id: 'form-1', title: 'Form 1' })]
      const deps = createMockDeps(
        { findByUserId: vi.fn().mockResolvedValue(Result.ok(forms)) },
        new Map() // 空のマップ = 応募なし
      )
      const usecase = new ListFormsByUserUsecase(deps)

      const result = await usecase.execute({ userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0].submissionCount).toBe(0)
      }
    })

    it('フォームがない場合は空配列を返す', async () => {
      const deps = createMockDeps({
        findByUserId: vi.fn().mockResolvedValue(Result.ok([])),
      })
      const usecase = new ListFormsByUserUsecase(deps)

      const result = await usecase.execute({ userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('リポジトリエラー時にエラーを返す', async () => {
      const deps = createMockDeps({
        findByUserId: vi.fn().mockResolvedValue(Result.err(new Error('DB error'))),
      })
      const usecase = new ListFormsByUserUsecase(deps)

      const result = await usecase.execute({ userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(ListFormsByUserRepositoryError)
        expect(result.error.type).toBe('repository_error')
        expect(result.error.message).toBe('DB error')
      }
    })
  })
})
