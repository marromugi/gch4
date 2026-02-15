import { describe, it, expect, vi } from 'vitest'
import { Result } from '../../../domain/shared/Result/Result'
import {
  SuggestFormFieldsUsecase,
  SuggestFormFieldsValidationError,
  SuggestFormFieldsLLMError,
  SuggestFormFieldsParseError,
  type SuggestFormFieldsDeps,
  type ISuggestFormFieldsLLMProvider,
} from './SuggestFormFieldsUsecase'

const createMockDeps = (
  overrides?: Partial<ISuggestFormFieldsLLMProvider>
): SuggestFormFieldsDeps => ({
  llmProvider: {
    chat: vi.fn().mockResolvedValue({
      text: JSON.stringify([
        { label: 'Name', description: 'Your full name', intent: 'collect name', required: true },
        { label: 'Email', description: null, intent: 'collect email', required: true },
      ]),
    }),
    ...overrides,
  },
})

describe('SuggestFormFieldsUsecase', () => {
  describe('正常系', () => {
    it('フィールド提案を取得できる', async () => {
      const deps = createMockDeps()
      const usecase = new SuggestFormFieldsUsecase(deps)

      const result = await usecase.execute({ description: 'A contact form for customer inquiries' })

      expect(Result.isOk(result)).toBe(true)
      if (Result.isOk(result)) {
        expect(result.value.fields).toHaveLength(2)
        expect(result.value.fields[0].label).toBe('Name')
        expect(result.value.fields[1].label).toBe('Email')
      }
    })
  })

  describe('異常系', () => {
    it('descriptionが空の場合バリデーションエラー', async () => {
      const deps = createMockDeps()
      const usecase = new SuggestFormFieldsUsecase(deps)

      const result = await usecase.execute({ description: '' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SuggestFormFieldsValidationError)
        expect(result.error.type).toBe('validation_error')
      }
    })

    it('LLM呼び出し失敗でLLMError', async () => {
      const deps = createMockDeps({
        chat: vi.fn().mockRejectedValue(new Error('API error')),
      })
      const usecase = new SuggestFormFieldsUsecase(deps)

      const result = await usecase.execute({ description: 'A contact form' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SuggestFormFieldsLLMError)
        expect(result.error.type).toBe('llm_error')
      }
    })

    it('不正なJSONレスポンスでParseError', async () => {
      const deps = createMockDeps({
        chat: vi.fn().mockResolvedValue({ text: 'not valid json' }),
      })
      const usecase = new SuggestFormFieldsUsecase(deps)

      const result = await usecase.execute({ description: 'A contact form' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SuggestFormFieldsParseError)
        expect(result.error.type).toBe('parse_error')
      }
    })

    it('配列でないレスポンスでParseError', async () => {
      const deps = createMockDeps({
        chat: vi.fn().mockResolvedValue({ text: '{"notArray": true}' }),
      })
      const usecase = new SuggestFormFieldsUsecase(deps)

      const result = await usecase.execute({ description: 'A contact form' })

      expect(Result.isErr(result)).toBe(true)
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(SuggestFormFieldsParseError)
      }
    })
  })
})
