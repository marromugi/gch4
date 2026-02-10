import type { Result } from '../../shared/Result/Result'
import type { InterviewFeedback } from '../../entity/InterviewFeedback/InterviewFeedback'
import type { InterviewFeedbackId } from '../../valueObject/InterviewFeedbackId/InterviewFeedbackId'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'

export interface IInterviewFeedbackRepository {
  findById(id: InterviewFeedbackId): Promise<Result<InterviewFeedback, Error>>
  findByApplicationId(applicationId: ApplicationId): Promise<Result<InterviewFeedback[], Error>>
  save(feedback: InterviewFeedback): Promise<Result<void, Error>>
}
