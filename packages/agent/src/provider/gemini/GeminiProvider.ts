import { FunctionCallingConfigMode, GoogleGenAI } from '@google/genai'
import { LLMProviderError } from '../errors'
import type {
  GenerateOptions,
  GenerateStructuredOptions,
  ILLMProvider,
  LLMMessage,
  LLMProviderConfig,
  LLMStructuredResponse,
  LLMTextResponse,
  LLMToolCallResponse,
  LLMToolDefinition,
  TokenUsage,
} from '../types'

const DEFAULT_MODEL = 'gemini-2.5-flash'

export class GeminiProvider implements ILLMProvider {
  private readonly client: GoogleGenAI
  private readonly defaultModel: string

  constructor(config: LLMProviderConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey })
    this.defaultModel = config.defaultModel ?? DEFAULT_MODEL
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<LLMTextResponse> {
    return this.chat([{ role: 'user', content: prompt }], options)
  }

  async chat(messages: LLMMessage[], options?: GenerateOptions): Promise<LLMTextResponse> {
    try {
      const { systemInstruction, contents } = this.convertMessages(messages, options?.systemPrompt)
      const model = options?.model ?? this.defaultModel

      const response = await this.client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: options?.temperature,
          maxOutputTokens: options?.maxOutputTokens,
          topP: options?.topP,
        },
      })

      const text = response.text
      if (text == null) {
        throw LLMProviderError.invalidResponse('Empty response from Gemini API')
      }

      return {
        text,
        usage: this.extractUsage(response),
      }
    } catch (error) {
      if (error instanceof LLMProviderError) throw error
      throw this.classifyError(error)
    }
  }

  async generateStructuredOutput<T>(
    prompt: string,
    options: GenerateStructuredOptions<T>
  ): Promise<LLMStructuredResponse<T>> {
    return this.chatStructured([{ role: 'user', content: prompt }], options)
  }

  async chatStructured<T>(
    messages: LLMMessage[],
    options: GenerateStructuredOptions<T>
  ): Promise<LLMStructuredResponse<T>> {
    try {
      const { systemInstruction, contents } = this.convertMessages(messages, options.systemPrompt)
      const model = options.model ?? this.defaultModel

      const response = await this.client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
          topP: options.topP,
          responseMimeType: 'application/json',
          responseJsonSchema: options.responseSchema,
        },
      })

      const rawText = response.text
      if (rawText == null) {
        throw LLMProviderError.invalidResponse('Empty response from Gemini API')
      }

      let data: T
      try {
        const parsed = JSON.parse(rawText)
        data = options.parse ? options.parse(parsed) : (parsed as T)
      } catch (parseError) {
        throw LLMProviderError.schemaValidation(
          `Failed to parse structured response: ${rawText}`,
          parseError
        )
      }

      return {
        data,
        rawText,
        usage: this.extractUsage(response),
      }
    } catch (error) {
      if (error instanceof LLMProviderError) throw error
      throw this.classifyError(error)
    }
  }

  async chatWithTools(
    messages: LLMMessage[],
    tools: LLMToolDefinition[],
    options?: GenerateOptions
  ): Promise<LLMToolCallResponse> {
    try {
      const { systemInstruction, contents } = this.convertMessages(messages, options?.systemPrompt)
      const model = options?.model ?? this.defaultModel

      // デバッグ: ツール定義の内容を確認
      const functionDeclarations = tools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }))

      console.log(
        '[GeminiProvider.chatWithTools] functionDeclarations:',
        JSON.stringify(functionDeclarations, null, 2)
      )
      console.log(
        '[GeminiProvider.chatWithTools] forceToolCall:',
        options?.forceToolCall,
        'model:',
        model
      )

      const response = await this.client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: options?.temperature,
          maxOutputTokens: options?.maxOutputTokens,
          topP: options?.topP,
          tools: [{ functionDeclarations }],
          // forceToolCall が true の場合、ツール呼び出しを強制する
          toolConfig: options?.forceToolCall
            ? { functionCallingConfig: { mode: FunctionCallingConfigMode.ANY } }
            : undefined,
        },
      })

      const toolCalls = (response.functionCalls ?? []).map((fc) => ({
        name: fc.name ?? '',
        args: (fc.args as Record<string, unknown>) ?? {},
      }))

      return {
        text: response.text ?? null,
        toolCalls,
        usage: this.extractUsage(response),
      }
    } catch (error) {
      if (error instanceof LLMProviderError) throw error
      throw this.classifyError(error)
    }
  }

  async *generateTextStream(prompt: string, options?: GenerateOptions): AsyncGenerator<string> {
    try {
      const { systemInstruction, contents } = this.convertMessages(
        [{ role: 'user', content: prompt }],
        options?.systemPrompt
      )
      const model = options?.model ?? this.defaultModel

      const response = await this.client.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: options?.temperature,
          maxOutputTokens: options?.maxOutputTokens,
          topP: options?.topP,
          thinkingConfig:
            options?.thinkingBudget != null
              ? { thinkingBudget: options.thinkingBudget }
              : undefined,
        },
      })

      let chunkIndex = 0
      for await (const chunk of response) {
        const hasCandidate = !!chunk.candidates?.length
        const text = chunk.text
        console.log(
          `[GeminiProvider.stream] chunk #${chunkIndex}: hasCandidate=${hasCandidate}, textLength=${text?.length ?? 'undefined'}`
        )
        chunkIndex++
        if (text) {
          yield text
        }
      }
      console.log(`[GeminiProvider.stream] generator finished after ${chunkIndex} chunks`)
    } catch (error) {
      if (error instanceof LLMProviderError) throw error
      throw this.classifyError(error)
    }
  }

  /** LLMMessage[] を Gemini API 形式に変換する */
  private convertMessages(
    messages: LLMMessage[],
    systemPrompt?: string
  ): {
    systemInstruction: string | undefined
    contents: Array<{ role: string; parts: Array<{ text: string }> }>
  } {
    const systemParts: string[] = []
    if (systemPrompt) {
      systemParts.push(systemPrompt)
    }

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemParts.push(msg.content)
        continue
      }

      // tool_result ロールはローカル状態追跡用なのでスキップ
      // (Explorer の状態復元などに使用される)
      // 注: 呼び出し元で SubSessionMessage[] を LLMMessage[] としてキャストしている場合があるため、
      // 実行時の安全性のために型アサーションを使用
      if ((msg.role as string) === 'tool_result') {
        continue
      }

      // content が undefined または空の場合はスキップ
      if (!msg.content) {
        continue
      }

      // Gemini は 'assistant' ではなく 'model' ロールを使用する
      const role = msg.role === 'assistant' ? 'model' : msg.role
      contents.push({
        role,
        parts: [{ text: msg.content }],
      })
    }

    return {
      systemInstruction: systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
      contents,
    }
  }

  /** レスポンスからトークン使用量を抽出 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractUsage(response: any): TokenUsage | undefined {
    const metadata = response.usageMetadata
    if (!metadata) return undefined

    return {
      promptTokens: metadata.promptTokenCount,
      completionTokens: metadata.candidatesTokenCount,
      totalTokens: metadata.totalTokenCount,
    }
  }

  /** エラーを LLMProviderError に分類する */
  private classifyError(error: unknown): LLMProviderError {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes('rate limit') || message.includes('429')) {
        return LLMProviderError.rateLimit(error.message, error)
      }
      if (message.includes('timeout') || message.includes('deadline')) {
        return LLMProviderError.timeout(error.message, error)
      }
      if (
        message.includes('safety') ||
        message.includes('blocked') ||
        message.includes('content filter')
      ) {
        return LLMProviderError.contentFilter(error.message, error)
      }
      return LLMProviderError.apiError(error.message, error)
    }

    return LLMProviderError.unknown(String(error), error)
  }
}
