import type { Result } from '../../shared/Result/Result'
import type { ReviewPolicyVersion } from '../../entity/ReviewPolicyVersion/ReviewPolicyVersion'
import type { ReviewPolicySignal } from '../../entity/ReviewPolicySignal/ReviewPolicySignal'
import type { ReviewProhibitedTopic } from '../../entity/ReviewProhibitedTopic/ReviewProhibitedTopic'
import type { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import type { JobId } from '../../valueObject/JobId/JobId'

export interface IReviewPolicyRepository {
  findById(id: ReviewPolicyVersionId): Promise<Result<ReviewPolicyVersion, Error>>
  findByJobId(jobId: JobId): Promise<Result<ReviewPolicyVersion[], Error>>
  findLatestPublishedByJobId(jobId: JobId): Promise<Result<ReviewPolicyVersion | null, Error>>
  save(policy: ReviewPolicyVersion): Promise<Result<void, Error>>

  // ReviewPolicySignal
  findSignalsByPolicyVersionId(
    policyVersionId: ReviewPolicyVersionId
  ): Promise<Result<ReviewPolicySignal[], Error>>
  saveSignals(signals: ReviewPolicySignal[]): Promise<Result<void, Error>>

  // ReviewProhibitedTopic
  findProhibitedTopicsByPolicyVersionId(
    policyVersionId: ReviewPolicyVersionId
  ): Promise<Result<ReviewProhibitedTopic[], Error>>
  saveProhibitedTopics(topics: ReviewProhibitedTopic[]): Promise<Result<void, Error>>
}
