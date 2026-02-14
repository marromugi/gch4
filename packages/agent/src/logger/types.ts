/**
 * ログレベル
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * ログコンテキスト（構造化ログ用）
 */
export interface LogContext {
  /** エージェント種別 */
  agent?: string
  /** セッションID */
  sessionId?: string
  /** ツール名 */
  tool?: string
  /** 追加データ */
  [key: string]: unknown
}

/**
 * Logger インターフェース
 */
export interface ILogger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
}

/**
 * デフォルトの Console Logger
 */
export class ConsoleLogger implements ILogger {
  private readonly prefix: string

  constructor(prefix: string = '[Agent]') {
    this.prefix = prefix
  }

  debug(message: string, context?: LogContext): void {
    console.debug(this.format('DEBUG', message, context))
  }

  info(message: string, context?: LogContext): void {
    console.info(this.format('INFO', message, context))
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.format('WARN', message, context))
  }

  error(message: string, context?: LogContext): void {
    console.error(this.format('ERROR', message, context))
  }

  private format(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `${timestamp} ${this.prefix} [${level}] ${message}${contextStr}`
  }
}

/**
 * 何も出力しない NoOp Logger
 */
export class NoOpLogger implements ILogger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}
