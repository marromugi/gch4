import { ReviewProhibitedTopic } from './ReviewProhibitedTopic'
import { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'

describe('ReviewProhibitedTopic', () => {
  it('有効なプロパティで作成できる', () => {
    const topic = ReviewProhibitedTopic.create({
      id: 'rpt-1',
      policyVersionId: ReviewPolicyVersionId.fromString('rpv-1'),
      topic: '年齢に関する質問',
      createdAt: new Date('2025-01-01'),
    })
    expect(topic.topic).toBe('年齢に関する質問')
  })

  it('空のtopicでエラーを投げる', () => {
    expect(() =>
      ReviewProhibitedTopic.create({
        id: 'rpt-1',
        policyVersionId: ReviewPolicyVersionId.fromString('rpv-1'),
        topic: '',
        createdAt: new Date('2025-01-01'),
      })
    ).toThrow('ReviewProhibitedTopic topic cannot be empty')
  })
})
