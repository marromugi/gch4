import { JobSchemaVersion } from './JobSchemaVersion'
import { JobSchemaVersionId } from '../../valueObject/JobSchemaVersionId/JobSchemaVersionId'
import { JobId } from '../../valueObject/JobId/JobId'
import { JobSchemaVersionStatus } from '../../valueObject/JobSchemaVersionStatus/JobSchemaVersionStatus'

const createVersion = (overrides: Partial<Parameters<typeof JobSchemaVersion.create>[0]> = {}) =>
  JobSchemaVersion.create({
    id: JobSchemaVersionId.fromString('sv-1'),
    jobId: JobId.fromString('job-1'),
    version: 1,
    status: JobSchemaVersionStatus.draft(),
    approvedAt: null,
    createdAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('JobSchemaVersion', () => {
  describe('create', () => {
    it('有効なプロパティで作成できる', () => {
      const sv = createVersion()
      expect(sv.version).toBe(1)
      expect(sv.status.isDraft()).toBe(true)
    })

    it('バージョン0以下でエラーを投げる', () => {
      expect(() => createVersion({ version: 0 })).toThrow(
        'JobSchemaVersion version must be positive'
      )
    })
  })

  describe('approve', () => {
    it('draftからapprovedに遷移できる', () => {
      const sv = createVersion()
      const approved = sv.approve()
      expect(approved.status.isApproved()).toBe(true)
      expect(approved.approvedAt).not.toBeNull()
    })

    it('approvedから再度approveするとエラーになる', () => {
      const sv = createVersion({ status: JobSchemaVersionStatus.approved() })
      expect(() => sv.approve()).toThrow('Cannot approve schema version in status: approved')
    })
  })

  describe('equals', () => {
    it('同じIDはequalである', () => {
      const sv1 = createVersion()
      const sv2 = createVersion()
      expect(sv1.equals(sv2)).toBe(true)
    })
  })
})
