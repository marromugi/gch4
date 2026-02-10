import { ReviewSignalCategory } from './ReviewSignalCategory'

describe('ReviewSignalCategory', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ReviewSignalCategory.from('must').value).toBe('must')
      expect(ReviewSignalCategory.from('ng').value).toBe('ng')
      expect(ReviewSignalCategory.from('nice').value).toBe('nice')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ReviewSignalCategory.from('invalid')).toThrow(
        'Invalid ReviewSignalCategory: invalid'
      )
    })
  })

  describe('ファクトリメソッド', () => {
    it('must()で作成できる', () => {
      expect(ReviewSignalCategory.must().isMust()).toBe(true)
    })

    it('ng()で作成できる', () => {
      expect(ReviewSignalCategory.ng().isNg()).toBe(true)
    })

    it('nice()で作成できる', () => {
      expect(ReviewSignalCategory.nice().isNice()).toBe(true)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ReviewSignalCategory.must().equals(ReviewSignalCategory.must())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ReviewSignalCategory.must().equals(ReviewSignalCategory.ng())).toBe(false)
    })
  })
})
