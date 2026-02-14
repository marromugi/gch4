import type { Result } from '../../shared/Result/Result'
import type { EventLog } from '../../entity/EventLog/EventLog'
import type { FormId } from '../../valueObject/FormId/FormId'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'

export interface IEventLogRepository {
  create(eventLog: EventLog): Promise<Result<void, Error>>
  findByFormId(formId: FormId): Promise<Result<EventLog[], Error>>
  findBySubmissionId(submissionId: SubmissionId): Promise<Result<EventLog[], Error>>
}
