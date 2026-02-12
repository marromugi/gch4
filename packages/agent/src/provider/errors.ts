/** LLM Provider エラーの種別 */
export type LLMProviderErrorType =
  | 'API_ERROR'
  | 'RATE_LIMIT'
  | 'INVALID_RESPONSE'
  | 'TIMEOUT'
  | 'SCHEMA_VALIDATION'
  | 'CONTENT_FILTER'
  | 'UNKNOWN'

/** LLM Provider エラー */
export class LLMProviderError extends Error {
  readonly type: LLMProviderErrorType
  readonly cause?: unknown

  constructor(type: LLMProviderErrorType, message: string, cause?: unknown) {
    super(message)
    this.name = 'LLMProviderError'
    this.type = type
    this.cause = cause
  }

  static apiError(message: string, cause?: unknown): LLMProviderError {
    return new LLMProviderError('API_ERROR', message, cause)
  }

  static rateLimit(message: string, cause?: unknown): LLMProviderError {
    return new LLMProviderError('RATE_LIMIT', message, cause)
  }

  static invalidResponse(message: string, cause?: unknown): LLMProviderError {
    return new LLMProviderError('INVALID_RESPONSE', message, cause)
  }

  static timeout(message: string, cause?: unknown): LLMProviderError {
    return new LLMProviderError('TIMEOUT', message, cause)
  }

  static schemaValidation(message: string, cause?: unknown): LLMProviderError {
    return new LLMProviderError('SCHEMA_VALIDATION', message, cause)
  }

  static contentFilter(message: string, cause?: unknown): LLMProviderError {
    return new LLMProviderError('CONTENT_FILTER', message, cause)
  }

  static unknown(message: string, cause?: unknown): LLMProviderError {
    return new LLMProviderError('UNKNOWN', message, cause)
  }
}
