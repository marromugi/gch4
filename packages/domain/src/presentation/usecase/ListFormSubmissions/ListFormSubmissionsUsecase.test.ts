import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Form } from '../../../domain/entity/Form/Form'
import { Submission } from '../../../domain/entity/Submission/Submission'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { FormStatus } from '../../../domain/valueObject/FormStatus/FormStatus'
import { UserId } from '../../../domain/valueObject/UserId/UserId'
import { SubmissionId } from '../../../domain/valueObject/SubmissionId/SubmissionId'
import { SubmissionStatus } from '../../../domain/valueObject/SubmissionStatus/SubmissionStatus'
import { FormSchemaVersionId } from '../../../domain/valueObject/FormSchemaVersionId/FormSchemaVersionId'
import type { IFormRepository } from '../../../domain/repository/IFormRepository/IFormRepository'
import type { ISubmissionRepository } from '../../../domain/repository/ISubmissionRepository/ISubmissionRepository'
import {
  ListFormSubmissionsUsecase,
  ListFormSubmissionsNotFoundError,
  ListFormSubmissionsForbiddenError,
  type ListFormSubmissionsDeps,
} from './ListFormSubmissionsUsecase'

const createMockForm = (overrides?: { createdBy?: string }): Form => {
  const now = new Date()
  return Form.create({
    id: FormId.fromString('form-1'),
    title: 'Test Form',
    description: null,
    purpose: null,
    completionMessage: null,
    status: FormStatus.draft(),
    createdBy: UserId.fromString(overrides?.createdBy ?? 'user-123'),
    createdAt: now,
    updatedAt: now,
  })
}

const createMockSubmission = (): Submission => {
  const now = new Date()
  return Submission.create({
    id: SubmissionId.fromString('submission-1'),
    formId: FormId.fromString('form-1'),
    schemaVersionId: FormSchemaVersionId.fromString('schema-1'),
    respondentName: null,
    respondentEmail: null,
    language: null,
    status: SubmissionStatus.new(),
    reviewCompletedAt: null,
    consentCheckedAt: null,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

const createMockDeps = (overrides?: {
  formRepository?: Partial<IFormRepository>
  submissionRepository?: Partial<ISubmissionRepository>
}): ListFormSubmissionsDeps => ({
  formRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockForm())),
    save: vi.fn(),
    findByUserId: vi.fn(),
    saveFormFields: vi.fn(),
    saveSchemaVersion: vi.fn(),
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
    ...overrides?.formRepository,
  } as IFormRepository,
  submissionRepository: {
    findByFormId: vi.fn().mockResolvedValue(Result.ok([])),
    findById: vi.fn(),
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
    ...overrides?.submissionRepository,
  } as ISubmissionRepository,
})

describe('ListFormSubmissionsUsecase', () => {
  describe('正常系', () => {
    it('フォームの提出一覧を取得できる', async () => {
      const submissions = [createMockSubmission()]
      const deps = createMockDeps({
        submissionRepository: {
          findByFormId: vi.fn().mockResolvedValue(Result.ok(submissions)),
        },
      })
      const usecase = new ListFormSubmissionsUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(1)
      }
    })

    it('提出がない場合は空配列を返す', async () => {
      const deps = createMockDeps()
      const usecase = new ListFormSubmissionsUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'user-123' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value).toHaveLength(0)
      }
    })
  })

  describe('異常系', () => {
    it('存在しないフォームでNotFoundError', async () => {
      const deps = createMockDeps({
        formRepository: {
          findById: vi.fn().mockResolvedValue(Result.err(new Error('Not found'))),
        },
      })
      const usecase = new ListFormSubmissionsUsecase(deps)

      const result = await usecase.execute({ formId: 'non-existent', userId: 'user-123' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(ListFormSubmissionsNotFoundError)
      }
    })

    it('所有者以外がアクセスするとForbiddenError', async () => {
      const deps = createMockDeps({
        formRepository: {
          findById: vi.fn().mockResolvedValue(Result.ok(createMockForm({ createdBy: 'owner' }))),
        },
      })
      const usecase = new ListFormSubmissionsUsecase(deps)

      const result = await usecase.execute({ formId: 'form-1', userId: 'other-user' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(ListFormSubmissionsForbiddenError)
      }
    })
  })
})
