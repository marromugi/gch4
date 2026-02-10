import type { Result } from '../../shared/Result/Result'
import type { EventLog } from '../../entity/EventLog/EventLog'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'

export interface IEventLogRepository {
  create(eventLog: EventLog): Promise<Result<void, Error>>
  findByJobId(jobId: JobId): Promise<Result<EventLog[], Error>>
  findByApplicationId(applicationId: ApplicationId): Promise<Result<EventLog[], Error>>
}
