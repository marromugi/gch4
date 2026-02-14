/** LLM メッセージのロール */
export type LLMMessageRole = 'user' | 'assistant' | 'system'

/** LLM に送信するメッセージ */
export interface LLMMessage {
  role: LLMMessageRole
  content: string
}

/** テキスト生成オプション */
export interface GenerateOptions {
  model?: string
  temperature?: number
  maxOutputTokens?: number
  topP?: number
  systemPrompt?: string
  /** thinking モデル用: thinking トークン予算。0=無効、-1=自動 */
  thinkingBudget?: number
  /** ツール呼び出しを強制する（chatWithTools 用） */
  forceToolCall?: boolean
}

/** 構造化出力オプション */
export interface GenerateStructuredOptions<T = unknown> extends GenerateOptions {
  responseSchema: Record<string, unknown>
  /** スキーマに対応する型のパースに利用（オプション） */
  parse?: (raw: unknown) => T
}

/** トークン使用量 */
export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

/** テキスト生成レスポンス */
export interface LLMTextResponse {
  text: string
  usage?: TokenUsage
}

/** 構造化出力レスポンス */
export interface LLMStructuredResponse<T> {
  data: T
  rawText: string
  usage?: TokenUsage
}

/** LLM Provider の設定 */
export interface LLMProviderConfig {
  apiKey: string
  defaultModel?: string
}

/** Tool (Function) の定義 */
export interface LLMToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown> // JSON Schema
}

/** Tool 呼び出し結果 */
export interface LLMToolCall {
  name: string
  args: Record<string, unknown>
}

/** Tool calling を含むレスポンス */
export interface LLMToolCallResponse {
  text: string | null
  toolCalls: LLMToolCall[]
  usage?: TokenUsage
}

/** LLM Provider インターフェース */
export interface ILLMProvider {
  /** 単発テキスト生成 */
  generateText(prompt: string, options?: GenerateOptions): Promise<LLMTextResponse>

  /** マルチターン会話 */
  chat(messages: LLMMessage[], options?: GenerateOptions): Promise<LLMTextResponse>

  /** 構造化出力（単発） */
  generateStructuredOutput<T>(
    prompt: string,
    options: GenerateStructuredOptions<T>
  ): Promise<LLMStructuredResponse<T>>

  /** マルチターン構造化出力 */
  chatStructured<T>(
    messages: LLMMessage[],
    options: GenerateStructuredOptions<T>
  ): Promise<LLMStructuredResponse<T>>

  /** ストリーミングテキスト生成 */
  generateTextStream(prompt: string, options?: GenerateOptions): AsyncGenerator<string>

  /** Tool calling 付きチャット */
  chatWithTools(
    messages: LLMMessage[],
    tools: LLMToolDefinition[],
    options?: GenerateOptions
  ): Promise<LLMToolCallResponse>
}
