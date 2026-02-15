import { EventLog } from './EventLog'
import { EventLogId } from '../../valueObject/EventLogId/EventLogId'
import { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import { EventType } from '../../valueObject/EventType/EventType'

describe('EventLog', () => {
  it('有効なプロパティで作成できる', () => {
    const log = EventLog.create({
      id: EventLogId.fromString('el-1'),
      formId: null,
      submissionId: SubmissionId.fromString('sub-1'),
      chatSessionId: null,
      eventType: EventType.submissionSubmitted(),
      metadata: null,
      createdAt: new Date('2025-01-01'),
    })
    expect(log.eventType.value).toBe('submission_submitted')
  })
})
