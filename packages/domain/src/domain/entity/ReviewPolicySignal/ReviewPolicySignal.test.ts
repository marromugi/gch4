import { ReviewPolicySignal } from './ReviewPolicySignal'
import { ReviewPolicySignalId } from '../../valueObject/ReviewPolicySignalId/ReviewPolicySignalId'
import { ReviewPolicyVersionId } from '../../valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'
import { ReviewSignalPriority } from '../../valueObject/ReviewSignalPriority/ReviewSignalPriority'
import { ReviewSignalCategory } from '../../valueObject/ReviewSignalCategory/ReviewSignalCategory'

describe('ReviewPolicySignal', () => {
  it('有効なプロパティで作成できる', () => {
    const signal = ReviewPolicySignal.create({
      id: ReviewPolicySignalId.fromString('rps-1'),
      policyVersionId: ReviewPolicyVersionId.fromString('rpv-1'),
      signalKey: 'self_driven',
      label: '自走力',
      description: '不確実な状況下での意思決定スタイル',
      priority: ReviewSignalPriority.high(),
      category: ReviewSignalCategory.must(),
      sortOrder: 0,
      createdAt: new Date('2025-01-01'),
    })
    expect(signal.signalKey).toBe('self_driven')
    expect(signal.priority.isHigh()).toBe(true)
    expect(signal.category.isMust()).toBe(true)
  })

  it('空のsignalKeyでエラーを投げる', () => {
    expect(() =>
      ReviewPolicySignal.create({
        id: ReviewPolicySignalId.fromString('rps-1'),
        policyVersionId: ReviewPolicyVersionId.fromString('rpv-1'),
        signalKey: '',
        label: '自走力',
        description: null,
        priority: ReviewSignalPriority.high(),
        category: ReviewSignalCategory.must(),
        sortOrder: 0,
        createdAt: new Date('2025-01-01'),
      })
    ).toThrow('ReviewPolicySignal signalKey cannot be empty')
  })

  it('空のlabelでエラーを投げる', () => {
    expect(() =>
      ReviewPolicySignal.create({
        id: ReviewPolicySignalId.fromString('rps-1'),
        policyVersionId: ReviewPolicyVersionId.fromString('rpv-1'),
        signalKey: 'self_driven',
        label: '',
        description: null,
        priority: ReviewSignalPriority.high(),
        category: ReviewSignalCategory.must(),
        sortOrder: 0,
        createdAt: new Date('2025-01-01'),
      })
    ).toThrow('ReviewPolicySignal label cannot be empty')
  })
})
