import { Result } from '../Result'

describe('Result', () => {
  describe('ok', () => {
    it('成功結果を作成できる', () => {
      const result = Result.ok('value')

      expect(result.success).toBe(true)
      expect(result).toEqual({ success: true, value: 'value' })
    })

    it('数値の成功結果を作成できる', () => {
      const result = Result.ok(42)

      expect(result).toEqual({ success: true, value: 42 })
    })

    it('null の成功結果を作成できる', () => {
      const result = Result.ok(null)

      expect(result).toEqual({ success: true, value: null })
    })
  })

  describe('err', () => {
    it('エラー結果を作成できる', () => {
      const result = Result.err('something went wrong')

      expect(result.success).toBe(false)
      expect(result).toEqual({ success: false, error: 'something went wrong' })
    })

    it('Error オブジェクトのエラー結果を作成できる', () => {
      const error = new Error('failure')
      const result = Result.err(error)

      expect(result).toEqual({ success: false, error })
    })
  })

  describe('isOk', () => {
    it('成功結果で true を返す', () => {
      const result = Result.ok('value')

      expect(Result.isOk(result)).toBe(true)
    })

    it('エラー結果で false を返す', () => {
      const result = Result.err('error')

      expect(Result.isOk(result)).toBe(false)
    })

    it('型ガードとして動作する', () => {
      const result: Result<string, string> = Result.ok('hello')

      if (Result.isOk(result)) {
        expect(result.value).toBe('hello')
      }
    })
  })

  describe('isErr', () => {
    it('エラー結果で true を返す', () => {
      const result = Result.err('error')

      expect(Result.isErr(result)).toBe(true)
    })

    it('成功結果で false を返す', () => {
      const result = Result.ok('value')

      expect(Result.isErr(result)).toBe(false)
    })

    it('型ガードとして動作する', () => {
      const result: Result<string, string> = Result.err('failure')

      if (Result.isErr(result)) {
        expect(result.error).toBe('failure')
      }
    })
  })
})
