/**
 * エージェントエラー種別
 */
export type AgentErrorType =
  | 'LLM_ERROR' // LLMProviderError をラップ
  | 'TOOL_EXECUTION_FAILED' // ツール実行失敗
  | 'TOOL_NOT_FOUND' // ツールが見つからない
  | 'CONTEXT_INVALID' // コンテキストが不正
  | 'STATE_INVALID' // 状態が不正
  | 'VALIDATION_FAILED' // バリデーション失敗
  | 'MAX_LOOP_ITERATIONS_REACHED' // 最大ループ回数到達

/**
 * エージェントエラー
 */
export class AgentError extends Error {
  readonly type: AgentErrorType
  readonly cause?: unknown

  constructor(type: AgentErrorType, message: string, cause?: unknown) {
    super(message)
    this.name = 'AgentError'
    this.type = type
    this.cause = cause
  }

  static llmError(message: string, cause?: unknown): AgentError {
    return new AgentError('LLM_ERROR', message, cause)
  }

  static toolExecutionFailed(toolName: string, cause?: unknown): AgentError {
    return new AgentError('TOOL_EXECUTION_FAILED', `Tool execution failed: ${toolName}`, cause)
  }

  static toolNotFound(toolName: string): AgentError {
    return new AgentError('TOOL_NOT_FOUND', `Tool not found: ${toolName}`)
  }

  static contextInvalid(message: string): AgentError {
    return new AgentError('CONTEXT_INVALID', message)
  }

  static stateInvalid(message: string): AgentError {
    return new AgentError('STATE_INVALID', message)
  }

  static validationFailed(message: string, cause?: unknown): AgentError {
    return new AgentError('VALIDATION_FAILED', message, cause)
  }

  static maxLoopIterationsReached(maxIterations: number): AgentError {
    return new AgentError(
      'MAX_LOOP_ITERATIONS_REACHED',
      `Max loop iterations reached: ${maxIterations}`
    )
  }
}
