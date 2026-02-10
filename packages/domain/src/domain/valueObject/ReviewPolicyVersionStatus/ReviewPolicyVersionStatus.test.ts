import { ReviewPolicyVersionStatus } from './ReviewPolicyVersionStatus'

describe('ReviewPolicyVersionStatus', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ReviewPolicyVersionStatus.from('draft').value).toBe('draft')
      expect(ReviewPolicyVersionStatus.from('confirmed').value).toBe('confirmed')
      expect(ReviewPolicyVersionStatus.from('published').value).toBe('published')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ReviewPolicyVersionStatus.from('invalid')).toThrow(
        'Invalid ReviewPolicyVersionStatus: invalid'
      )
    })
  })

  describe('canTransitionTo', () => {
    it('draftからconfirmedに遷移できる', () => {
      expect(
        ReviewPolicyVersionStatus.draft().canTransitionTo(ReviewPolicyVersionStatus.confirmed())
      ).toBe(true)
    })

    it('confirmedからpublishedに遷移できる', () => {
      expect(
        ReviewPolicyVersionStatus.confirmed().canTransitionTo(ReviewPolicyVersionStatus.published())
      ).toBe(true)
    })

    it('publishedからは遷移できない', () => {
      expect(
        ReviewPolicyVersionStatus.published().canTransitionTo(ReviewPolicyVersionStatus.draft())
      ).toBe(false)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ReviewPolicyVersionStatus.draft().equals(ReviewPolicyVersionStatus.draft())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ReviewPolicyVersionStatus.draft().equals(ReviewPolicyVersionStatus.confirmed())).toBe(
        false
      )
    })
  })
})
