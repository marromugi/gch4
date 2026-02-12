import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import { Application } from '../../../domain/entity/Application/Application'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../../domain/valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../../domain/valueObject/ApplicationStatus/ApplicationStatus'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import {
  UpdateApplicationStatusUsecase,
  UpdateApplicationStatusRepositoryError,
  UpdateApplicationStatusTransitionError,
  type UpdateApplicationStatusDeps,
} from './UpdateApplicationStatusUsecase'

const createMockApplication = (status: ApplicationStatus): Application => {
  const now = new Date()
  return Application.reconstruct({
    id: ApplicationId.fromString('app-1'),
    jobId: JobId.fromString('job-1'),
    schemaVersionId: JobSchemaVersionId.fromString('sv-1'),
    applicantName: null,
    applicantEmail: null,
    language: null,
    country: null,
    timezone: null,
    status,
    meetLink: null,
    extractionReviewedAt: null,
    consentCheckedAt: null,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

const createMockDeps = (
  status: ApplicationStatus = ApplicationStatus.new()
): UpdateApplicationStatusDeps => ({
  applicationRepository: {
    findById: vi.fn().mockResolvedValue(Result.ok(createMockApplication(status))),
    save: vi.fn().mockResolvedValue(Result.ok(undefined)),
  } as unknown as IApplicationRepository,
})

describe('UpdateApplicationStatusUsecase', () => {
  describe('正常系', () => {
    it('new -> scheduling に遷移できる', async () => {
      const deps = createMockDeps(ApplicationStatus.new())
      const usecase = new UpdateApplicationStatusUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        newStatus: 'scheduling',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isScheduling()).toBe(true)
      }
      expect(deps.applicationRepository.save).toHaveBeenCalled()
    })

    it('scheduling -> interviewed に遷移できる', async () => {
      const deps = createMockDeps(ApplicationStatus.scheduling())
      const usecase = new UpdateApplicationStatusUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        newStatus: 'interviewed',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isInterviewed()).toBe(true)
      }
    })

    it('new -> closed に遷移できる', async () => {
      const deps = createMockDeps(ApplicationStatus.new())
      const usecase = new UpdateApplicationStatusUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        newStatus: 'closed',
      })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.status.isClosed()).toBe(true)
      }
    })
  })

  describe('異常系', () => {
    it('不正なステータス値の場合エラーを返す', async () => {
      const deps = createMockDeps()
      const usecase = new UpdateApplicationStatusUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        newStatus: 'invalid_status',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateApplicationStatusTransitionError)
      }
    })

    it('不正な遷移の場合エラーを返す', async () => {
      const deps = createMockDeps(ApplicationStatus.closed())
      const usecase = new UpdateApplicationStatusUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        newStatus: 'scheduling',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateApplicationStatusTransitionError)
      }
    })

    it('リポジトリエラーの場合エラーを返す', async () => {
      const deps = createMockDeps()
      vi.mocked(deps.applicationRepository.findById).mockResolvedValue(
        Result.err(new Error('Not found'))
      )
      const usecase = new UpdateApplicationStatusUsecase(deps)

      const result = await usecase.execute({
        applicationId: 'app-1',
        newStatus: 'scheduling',
      })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(UpdateApplicationStatusRepositoryError)
      }
    })
  })
})
