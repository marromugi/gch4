import { ReviewSignalPriority } from './ReviewSignalPriority'

describe('ReviewSignalPriority', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ReviewSignalPriority.from('high').value).toBe('high')
      expect(ReviewSignalPriority.from('supporting').value).toBe('supporting')
      expect(ReviewSignalPriority.from('concern').value).toBe('concern')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ReviewSignalPriority.from('invalid')).toThrow(
        'Invalid ReviewSignalPriority: invalid'
      )
    })
  })

  describe('ファクトリメソッド', () => {
    it('high()で作成できる', () => {
      expect(ReviewSignalPriority.high().isHigh()).toBe(true)
    })

    it('supporting()で作成できる', () => {
      expect(ReviewSignalPriority.supporting().isSupporting()).toBe(true)
    })

    it('concern()で作成できる', () => {
      expect(ReviewSignalPriority.concern().isConcern()).toBe(true)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ReviewSignalPriority.high().equals(ReviewSignalPriority.high())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ReviewSignalPriority.high().equals(ReviewSignalPriority.concern())).toBe(false)
    })
  })
})
