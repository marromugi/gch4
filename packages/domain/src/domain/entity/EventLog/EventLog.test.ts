import { EventLog } from './EventLog'
import { EventLogId } from '../../valueObject/EventLogId/EventLogId'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { EventType } from '../../valueObject/EventType/EventType'

describe('EventLog', () => {
  it('有効なプロパティで作成できる', () => {
    const log = EventLog.create({
      id: EventLogId.fromString('el-1'),
      jobId: null,
      applicationId: ApplicationId.fromString('app-1'),
      chatSessionId: null,
      policyVersionId: null,
      eventType: EventType.applicationSubmitted(),
      metadata: null,
      createdAt: new Date('2025-01-01'),
    })
    expect(log.eventType.value).toBe('application_submitted')
  })
})
