import { ConsentLog } from './ConsentLog'
import { ConsentLogId } from '../../valueObject/ConsentLogId/ConsentLogId'
import { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import { ConsentType } from '../../valueObject/ConsentType/ConsentType'

describe('ConsentLog', () => {
  it('有効なプロパティで作成できる', () => {
    const log = ConsentLog.create({
      id: ConsentLogId.fromString('cl-1'),
      submissionId: SubmissionId.fromString('sub-1'),
      consentType: ConsentType.dataUsage(),
      consented: true,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2025-01-01'),
    })
    expect(log.consented).toBe(true)
    expect(log.consentType.isDataUsage()).toBe(true)
  })

  it('equalsが正しく動作する', () => {
    const log1 = ConsentLog.create({
      id: ConsentLogId.fromString('cl-1'),
      submissionId: SubmissionId.fromString('sub-1'),
      consentType: ConsentType.dataUsage(),
      consented: true,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date('2025-01-01'),
    })
    const log2 = ConsentLog.create({
      id: ConsentLogId.fromString('cl-1'),
      submissionId: SubmissionId.fromString('sub-1'),
      consentType: ConsentType.privacyPolicy(),
      consented: false,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date('2025-01-01'),
    })
    expect(log1.equals(log2)).toBe(true)
  })
})
