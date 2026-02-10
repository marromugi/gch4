import { ExtractedFieldSource } from './ExtractedFieldSource'

describe('ExtractedFieldSource', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ExtractedFieldSource.from('llm').value).toBe('llm')
      expect(ExtractedFieldSource.from('manual').value).toBe('manual')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ExtractedFieldSource.from('invalid')).toThrow(
        'Invalid ExtractedFieldSource: invalid'
      )
    })
  })

  describe('ファクトリメソッド', () => {
    it('llm()で作成できる', () => {
      expect(ExtractedFieldSource.llm().isLlm()).toBe(true)
    })

    it('manual()で作成できる', () => {
      expect(ExtractedFieldSource.manual().isManual()).toBe(true)
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ExtractedFieldSource.llm().equals(ExtractedFieldSource.llm())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ExtractedFieldSource.llm().equals(ExtractedFieldSource.manual())).toBe(false)
    })
  })
})
