import type { IKVStore, KVSetOptions } from './IKVStore'

/**
 * Cloudflare KV Namespace 型
 *
 * Cloudflare Workers の KVNamespace を参照。
 * 実行環境に依存するため、ここでは最小限のインターフェースを定義。
 */
export interface CloudflareKVNamespace {
  get(key: string, options?: { type: 'json' }): Promise<unknown>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>
}

/**
 * Cloudflare KV 実装
 *
 * Cloudflare Workers の KV Namespace を使用したストア実装。
 */
export class CloudflareKVStore implements IKVStore {
  constructor(private readonly kv: CloudflareKVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key, { type: 'json' })
    return value as T | null
  }

  async set<T>(key: string, value: T, options?: KVSetOptions): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), {
      expirationTtl: options?.expirationTtl,
    })
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key)
  }

  async list(prefix: string): Promise<string[]> {
    const result = await this.kv.list({ prefix })
    return result.keys.map((k) => k.name)
  }
}
