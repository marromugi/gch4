import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeminiProvider } from './GeminiProvider'
import { LLMProviderError } from '../errors'

// @google/genai のモック
const mockGenerateContent = vi.fn()

vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = { generateContent: mockGenerateContent }
  },
}))

describe('GeminiProvider', () => {
  let provider: GeminiProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new GeminiProvider({ apiKey: 'test-api-key' })
  })

  describe('generateText', () => {
    it('テキストを生成できる', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'Hello, world!',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      })

      const result = await provider.generateText('Say hello')

      expect(result.text).toBe('Hello, world!')
      expect(result.usage).toEqual({
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      })
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'Say hello' }] }],
        config: {
          systemInstruction: undefined,
          temperature: undefined,
          maxOutputTokens: undefined,
          topP: undefined,
        },
      })
    })

    it('カスタムオプションを渡せる', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Response' })

      await provider.generateText('Test', {
        model: 'gemini-2.5-pro',
        temperature: 0.5,
        maxOutputTokens: 1000,
        topP: 0.9,
        systemPrompt: 'Be helpful',
      })

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: 'Test' }] }],
        config: {
          systemInstruction: 'Be helpful',
          temperature: 0.5,
          maxOutputTokens: 1000,
          topP: 0.9,
        },
      })
    })

    it('空レスポンスで INVALID_RESPONSE エラーを投げる', async () => {
      mockGenerateContent.mockResolvedValue({ text: null })

      await expect(provider.generateText('Test')).rejects.toThrow(LLMProviderError)
      await expect(provider.generateText('Test')).rejects.toMatchObject({
        type: 'INVALID_RESPONSE',
      })
    })
  })

  describe('chat', () => {
    it('マルチターン会話を処理できる', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'I have 4 paws.' })

      const result = await provider.chat([
        { role: 'user', content: 'I have a dog.' },
        { role: 'assistant', content: 'Nice! What breed?' },
        { role: 'user', content: 'How many paws does my dog have?' },
      ])

      expect(result.text).toBe('I have 4 paws.')
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: [
            { role: 'user', parts: [{ text: 'I have a dog.' }] },
            { role: 'model', parts: [{ text: 'Nice! What breed?' }] },
            { role: 'user', parts: [{ text: 'How many paws does my dog have?' }] },
          ],
        })
      )
    })

    it('system ロールのメッセージを systemInstruction に分離する', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'Meow!' })

      await provider.chat([
        { role: 'system', content: 'You are a cat.' },
        { role: 'user', content: 'Say something.' },
      ])

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: [{ role: 'user', parts: [{ text: 'Say something.' }] }],
          config: expect.objectContaining({
            systemInstruction: 'You are a cat.',
          }),
        })
      )
    })

    it('systemPrompt オプションと system メッセージを結合する', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'OK' })

      await provider.chat(
        [
          { role: 'system', content: 'Rule 2' },
          { role: 'user', content: 'Hello' },
        ],
        { systemPrompt: 'Rule 1' }
      )

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: 'Rule 1\n\nRule 2',
          }),
        })
      )
    })
  })

  describe('generateStructuredOutput', () => {
    it('構造化出力を生成できる', async () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      }

      mockGenerateContent.mockResolvedValue({
        text: '{"name":"Taro","age":25}',
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 8, totalTokenCount: 18 },
      })

      const result = await provider.generateStructuredOutput<{ name: string; age: number }>(
        'Extract info',
        { responseSchema: schema }
      )

      expect(result.data).toEqual({ name: 'Taro', age: 25 })
      expect(result.rawText).toBe('{"name":"Taro","age":25}')
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            responseMimeType: 'application/json',
            responseJsonSchema: schema,
          }),
        })
      )
    })

    it('カスタム parse 関数を使用できる', async () => {
      mockGenerateContent.mockResolvedValue({ text: '{"value":42}' })

      const result = await provider.generateStructuredOutput<number>('Get number', {
        responseSchema: { type: 'object', properties: { value: { type: 'number' } } },
        parse: (raw) => (raw as { value: number }).value,
      })

      expect(result.data).toBe(42)
    })

    it('不正な JSON で SCHEMA_VALIDATION エラーを投げる', async () => {
      mockGenerateContent.mockResolvedValue({ text: 'not json' })

      await expect(
        provider.generateStructuredOutput('Test', {
          responseSchema: { type: 'object' },
        })
      ).rejects.toMatchObject({
        type: 'SCHEMA_VALIDATION',
      })
    })
  })

  describe('chatStructured', () => {
    it('マルチターン構造化出力を処理できる', async () => {
      mockGenerateContent.mockResolvedValue({ text: '{"result":"ok"}' })

      const result = await provider.chatStructured<{ result: string }>(
        [
          { role: 'user', content: 'Start' },
          { role: 'assistant', content: 'OK' },
          { role: 'user', content: 'Give result' },
        ],
        {
          responseSchema: { type: 'object', properties: { result: { type: 'string' } } },
        }
      )

      expect(result.data).toEqual({ result: 'ok' })
    })
  })

  describe('エラーハンドリング', () => {
    it('rate limit エラーを分類する', async () => {
      mockGenerateContent.mockRejectedValue(new Error('429 rate limit exceeded'))

      await expect(provider.generateText('Test')).rejects.toMatchObject({
        type: 'RATE_LIMIT',
      })
    })

    it('timeout エラーを分類する', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Request timeout'))

      await expect(provider.generateText('Test')).rejects.toMatchObject({
        type: 'TIMEOUT',
      })
    })

    it('content filter エラーを分類する', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Content blocked by safety filter'))

      await expect(provider.generateText('Test')).rejects.toMatchObject({
        type: 'CONTENT_FILTER',
      })
    })

    it('不明なエラーを API_ERROR として分類する', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Some API error'))

      await expect(provider.generateText('Test')).rejects.toMatchObject({
        type: 'API_ERROR',
      })
    })

    it('非 Error オブジェクトを UNKNOWN として分類する', async () => {
      mockGenerateContent.mockRejectedValue('string error')

      await expect(provider.generateText('Test')).rejects.toMatchObject({
        type: 'UNKNOWN',
      })
    })
  })
})
