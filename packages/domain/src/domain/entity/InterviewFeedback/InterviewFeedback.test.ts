import { InterviewFeedback } from './InterviewFeedback'
import { InterviewFeedbackId } from '../../valueObject/InterviewFeedbackId/InterviewFeedbackId'
import { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'

const createFeedback = (overrides: Partial<Parameters<typeof InterviewFeedback.create>[0]> = {}) =>
  InterviewFeedback.create({
    id: InterviewFeedbackId.fromString('if-1'),
    applicationId: ApplicationId.fromString('app-1'),
    chatSessionId: ChatSessionId.fromString('cs-1'),
    policyVersionId: ReviewPolicyVersionId.fromString('rpv-1'),
    structuredData: null,
    structuredSchemaVersion: 1,
    summaryConfirmedAt: null,
    submittedAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  })

describe('InterviewFeedback', () => {
  describe('updateStructuredData', () => {
    it('構造化データを更新できる', () => {
      const fb = createFeedback()
      const updated = fb.updateStructuredData('{"evidence_facts":[]}')
      expect(updated.structuredData).toBe('{"evidence_facts":[]}')
    })
  })

  describe('confirmSummary', () => {
    it('要約を確認できる', () => {
      const fb = createFeedback()
      const confirmed = fb.confirmSummary()
      expect(confirmed.summaryConfirmedAt).not.toBeNull()
    })
  })

  describe('submit', () => {
    it('要約確認後に提出できる', () => {
      const fb = createFeedback({ summaryConfirmedAt: new Date() })
      const submitted = fb.submit()
      expect(submitted.submittedAt).not.toBeNull()
    })

    it('要約確認前に提出するとエラーになる', () => {
      const fb = createFeedback()
      expect(() => fb.submit()).toThrow('Summary must be confirmed before submission')
    })
  })
})
