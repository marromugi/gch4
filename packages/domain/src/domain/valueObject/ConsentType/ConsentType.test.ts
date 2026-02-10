import { ConsentType } from './ConsentType'

describe('ConsentType', () => {
  describe('from', () => {
    it('有効な値から作成できる', () => {
      expect(ConsentType.from('data_usage').value).toBe('data_usage')
      expect(ConsentType.from('privacy_policy').value).toBe('privacy_policy')
    })

    it('無効な値でエラーを投げる', () => {
      expect(() => ConsentType.from('invalid')).toThrow('Invalid ConsentType: invalid')
    })
  })

  describe('equals', () => {
    it('同じ値はequalである', () => {
      expect(ConsentType.dataUsage().equals(ConsentType.dataUsage())).toBe(true)
    })

    it('異なる値はequalでない', () => {
      expect(ConsentType.dataUsage().equals(ConsentType.privacyPolicy())).toBe(false)
    })
  })
})
