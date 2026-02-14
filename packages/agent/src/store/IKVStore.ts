/**
 * KVStore インターフェース
 *
 * Cloudflare KV / Firestore などの KV ストアを抽象化する。
 * セッション状態の永続化に使用する。
 */
export interface IKVStore {
  /**
   * 値を取得
   * @param key キー
   * @returns 値（存在しない場合は null）
   */
  get<T>(key: string): Promise<T | null>

  /**
   * 値を設定
   * @param key キー
   * @param value 値
   * @param options TTL などのオプション
   */
  set<T>(key: string, value: T, options?: KVSetOptions): Promise<void>

  /**
   * 値を削除
   * @param key キー
   */
  delete(key: string): Promise<void>

  /**
   * プレフィックスに一致するキーを一覧取得
   * @param prefix キーのプレフィックス
   */
  list(prefix: string): Promise<string[]>
}

/**
 * KV 設定オプション
 */
export interface KVSetOptions {
  /** TTL（秒単位） */
  expirationTtl?: number
}

/**
 * KV キー生成ユーティリティ
 */
export const KVKeys = {
  /** メインセッション: session:{sessionId} */
  mainSession: (sessionId: string) => `session:${sessionId}`,

  /** サブセッション: subsession:{sessionId}:{stackIndex} */
  subSession: (sessionId: string, stackIndex: number) => `subsession:${sessionId}:${stackIndex}`,

  /** セッションプレフィックス */
  sessionPrefix: (sessionId: string) => `session:${sessionId}`,

  /** サブセッションプレフィックス */
  subSessionPrefix: (sessionId: string) => `subsession:${sessionId}:`,

  /** フォームデータ（完了時）: formData:{sessionId} */
  formData: (sessionId: string) => `formData:${sessionId}`,
} as const
