import type { IKVStore } from './IKVStore'
import { CloudflareKVStore, type CloudflareKVNamespace } from './CloudflareKVStore'
import { FirestoreKVStore, type FirestoreKVConfig } from './FirestoreKVStore'
import { InMemoryKVStore } from './InMemoryKVStore'

/**
 * KVStore の種別
 */
export type KVStoreType = 'cloudflare' | 'firestore' | 'memory'

/**
 * KVStore ファクトリの設定
 */
export interface KVStoreFactoryConfig {
  /** KVStore の種別 */
  type: KVStoreType

  /** Cloudflare KV Namespace (type='cloudflare' の場合必須) */
  cloudflareKV?: CloudflareKVNamespace

  /** Firestore 設定 (type='firestore' の場合必須) */
  firestoreConfig?: FirestoreKVConfig
}

/**
 * KVStore ファクトリ
 *
 * 設定に基づいて適切な KVStore 実装を生成する。
 */
export function createKVStore(config: KVStoreFactoryConfig): IKVStore {
  switch (config.type) {
    case 'cloudflare':
      if (!config.cloudflareKV) {
        throw new Error('Cloudflare KV namespace is required for cloudflare type')
      }
      return new CloudflareKVStore(config.cloudflareKV)

    case 'firestore':
      if (!config.firestoreConfig) {
        throw new Error('Firestore config is required for firestore type')
      }
      return new FirestoreKVStore(config.firestoreConfig)

    case 'memory':
      return new InMemoryKVStore()

    default:
      throw new Error(`Unknown KVStore type: ${config.type}`)
  }
}

/**
 * 環境変数から KVStoreType を取得
 *
 * @param envValue 環境変数の値 (KV_STORE_TYPE)
 * @param defaultType デフォルト値
 */
export function parseKVStoreType(
  envValue: string | undefined,
  defaultType: KVStoreType = 'cloudflare'
): KVStoreType {
  if (!envValue) return defaultType

  const normalized = envValue.toLowerCase()
  if (normalized === 'cloudflare' || normalized === 'firestore' || normalized === 'memory') {
    return normalized
  }

  console.warn(`Unknown KV_STORE_TYPE: ${envValue}, falling back to ${defaultType}`)
  return defaultType
}
