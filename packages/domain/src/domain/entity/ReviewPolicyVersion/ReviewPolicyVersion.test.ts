import { ReviewPolicyVersion } from './ReviewPolicyVersion'
import { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { JobId } from '../../valueObject/JobId/JobId'
import { UserId } from '../../valueObject/UserId/UserId'
import { ReviewPolicyVersionStatus } from '../../valueObject/ReviewPolicyVersionStatus/ReviewPolicyVersionStatus'

const createPolicy = (overrides: Partial<Parameters<typeof ReviewPolicyVersion.create>[0]> = {}) =>
  ReviewPolicyVersion.create({
    id: ReviewPolicyVersionId.fromString('rpv-1'),
    jobId: JobId.fromString('job-1'),
    version: 1,
    status: ReviewPolicyVersionStatus.draft(),
    softCap: 6,
    hardCap: 10,
    createdBy: UserId.fromString('user-1'),
    confirmedAt: null,
    publishedAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('ReviewPolicyVersion', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const policy = createPolicy()
      expect(policy.version).toBe(1)
      expect(policy.softCap).toBe(6)
      expect(policy.hardCap).toBe(10)
    })

    it('softCap >= hardCapでエラーを投げる', () => {
      expect(() => createPolicy({ softCap: 10, hardCap: 10 })).toThrow(
        'softCap must be less than hardCap'
      )
    })

    it('バージョン0以下でエラーを投げる', () => {
      expect(() => createPolicy({ version: 0 })).toThrow(
        'ReviewPolicyVersion version must be positive'
      )
    })
  })

  describe('confirm', () => {
    it('draftからconfirmedに遷移できる', () => {
      const policy = createPolicy()
      const confirmed = policy.confirm()
      expect(confirmed.status.isConfirmed()).toBe(true)
      expect(confirmed.confirmedAt).not.toBeNull()
    })
  })

  describe('publish', () => {
    it('confirmedからpublishedに遷移できる', () => {
      const policy = createPolicy({ status: ReviewPolicyVersionStatus.confirmed() })
      const published = policy.publish()
      expect(published.status.isPublished()).toBe(true)
      expect(published.publishedAt).not.toBeNull()
    })

    it('draftからpublishするとエラーになる', () => {
      const policy = createPolicy()
      expect(() => policy.publish()).toThrow('Cannot publish policy in status: draft')
    })
  })
})
