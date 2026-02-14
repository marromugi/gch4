import type { IKVStore, KVSetOptions } from './IKVStore'

interface StoredValue {
  value: unknown
  expiresAt?: number
}

/**
 * インメモリ KV 実装
 *
 * テストやローカル開発用のメモリベースストア実装。
 * TTL もシミュレートする。
 */
export class InMemoryKVStore implements IKVStore {
  private store: Map<string, StoredValue> = new Map()

  async get<T>(key: string): Promise<T | null> {
    const stored = this.store.get(key)
    if (!stored) {
      return null
    }

    // TTL チェック
    if (stored.expiresAt && stored.expiresAt < Date.now()) {
      this.store.delete(key)
      return null
    }

    return stored.value as T
  }

  async set<T>(key: string, value: T, options?: KVSetOptions): Promise<void> {
    const stored: StoredValue = {
      value,
      expiresAt: options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : undefined,
    }
    this.store.set(key, stored)
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async list(prefix: string): Promise<string[]> {
    const keys: string[] = []
    const now = Date.now()

    for (const [key, stored] of this.store.entries()) {
      // TTL チェック
      if (stored.expiresAt && stored.expiresAt < now) {
        this.store.delete(key)
        continue
      }

      if (key.startsWith(prefix)) {
        keys.push(key)
      }
    }

    return keys
  }

  /**
   * ストアをクリア（テスト用）
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * 期限切れエントリを削除（テスト用）
   */
  cleanupExpired(): void {
    const now = Date.now()
    for (const [key, stored] of this.store.entries()) {
      if (stored.expiresAt && stored.expiresAt < now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * ストア内のエントリ数を取得（テスト用）
   */
  size(): number {
    return this.store.size
  }
}
