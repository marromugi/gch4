import { Application } from './Application'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../valueObject/JobId/JobId'
import { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { ApplicationStatus } from '../../valueObject/ApplicationStatus/ApplicationStatus'

const createApp = (overrides: Partial<Parameters<typeof Application.create>[0]> = {}) =>
  Application.create({
    id: ApplicationId.fromString('app-1'),
    jobId: JobId.fromString('job-1'),
    schemaVersionId: JobSchemaVersionId.fromString('sv-1'),
    applicantName: null,
    applicantEmail: null,
    language: null,
    country: null,
    timezone: null,
    status: ApplicationStatus.new(),
    meetLink: null,
    extractionReviewedAt: null,
    consentCheckedAt: null,
    submittedAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('Application', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const app = createApp()
      expect(app.status.isNew()).toBe(true)
      expect(app.applicantName).toBeNull()
    })
  })

  describe('setBootstrapInfo', () => {
    it('言語・居住国・タイムゾーンを設定できる', () => {
      const app = createApp()
      const updated = app.setBootstrapInfo('ja', 'JP', 'Asia/Tokyo')
      expect(updated.language).toBe('ja')
      expect(updated.country).toBe('JP')
      expect(updated.timezone).toBe('Asia/Tokyo')
    })
  })

  describe('応募フロー順序', () => {
    it('抽出確認 -> 同意チェック -> 応募確定の順序で進む', () => {
      const app = createApp()
      const reviewed = app.markExtractionReviewed()
      expect(reviewed.extractionReviewedAt).not.toBeNull()

      const consented = reviewed.markConsentChecked()
      expect(consented.consentCheckedAt).not.toBeNull()

      const submitted = consented.submit()
      expect(submitted.submittedAt).not.toBeNull()
    })

    it('抽出確認前に同意チェックするとエラーになる', () => {
      const app = createApp()
      expect(() => app.markConsentChecked()).toThrow(
        'Extraction must be reviewed before consent check'
      )
    })

    it('抽出確認前に応募確定するとエラーになる', () => {
      const app = createApp()
      expect(() => app.submit()).toThrow('Extraction must be reviewed before submission')
    })

    it('同意チェック前に応募確定するとエラーになる', () => {
      const app = createApp()
      const reviewed = app.markExtractionReviewed()
      expect(() => reviewed.submit()).toThrow('Consent must be checked before submission')
    })
  })

  describe('transitionTo', () => {
    it('newからschedulingに遷移できる', () => {
      const app = createApp()
      const scheduling = app.transitionTo(ApplicationStatus.scheduling())
      expect(scheduling.status.isScheduling()).toBe(true)
    })

    it('不正な遷移はエラーになる', () => {
      const app = createApp({ status: ApplicationStatus.closed() })
      expect(() => app.transitionTo(ApplicationStatus.new())).toThrow(
        'Cannot transition from closed to new'
      )
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const app1 = createApp()
      const app2 = createApp()
      expect(app1.equals(app2)).toBe(true)
    })
  })
})
