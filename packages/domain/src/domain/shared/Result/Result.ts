/**
 * 操作結果を表す型
 * エラーハンドリングを明示的にする
 */
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E }

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ success: true, value }),
  err: <E>(error: E): Result<never, E> => ({ success: false, error }),
  isOk: <T, E>(result: Result<T, E>): result is { success: true; value: T } => result.success,
  isErr: <T, E>(result: Result<T, E>): result is { success: false; error: E } => !result.success,
}
