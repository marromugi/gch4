import { FieldPath } from 'firebase-admin/firestore'
import type { IKVStore, KVSetOptions } from './IKVStore'
import type { Firestore } from 'firebase-admin/firestore'

/**
 * Firestore KV 設定
 */
export interface FirestoreKVConfig {
  /** Firestore インスタンス */
  firestore: Firestore

  /** コレクション名（デフォルト: 'kv-store'） */
  collectionName?: string
}

/**
 * Firestore ドキュメントの型
 */
interface KVDocument {
  /** JSON エンコードされた値 */
  value: string

  /** 有効期限（秒単位の Unix タイムスタンプ、null = 無期限） */
  expiresAt: number | null

  /** 作成日時（秒単位の Unix タイムスタンプ） */
  createdAt: number
}

/**
 * Firestore KV 実装
 *
 * firebase-admin SDK を使用した KV ストア実装。
 * Node.js 環境で動作。
 */
export class FirestoreKVStore implements IKVStore {
  private readonly db: Firestore
  private readonly collectionName: string

  constructor(config: FirestoreKVConfig) {
    this.db = config.firestore
    this.collectionName = config.collectionName ?? 'kv-store'
  }

  async get<T>(key: string): Promise<T | null> {
    const docId = this.encodeKey(key)
    const docRef = this.db.collection(this.collectionName).doc(docId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return null
    }

    const data = doc.data() as KVDocument

    // TTL チェック
    if (data.expiresAt && data.expiresAt < this.nowSeconds()) {
      // 期限切れ - 非同期で削除して null を返す
      docRef.delete().catch(() => {})
      return null
    }

    return JSON.parse(data.value) as T
  }

  async set<T>(key: string, value: T, options?: KVSetOptions): Promise<void> {
    const docId = this.encodeKey(key)
    const now = this.nowSeconds()

    const data: KVDocument = {
      value: JSON.stringify(value),
      expiresAt: options?.expirationTtl ? now + options.expirationTtl : null,
      createdAt: now,
    }

    await this.db.collection(this.collectionName).doc(docId).set(data)
  }

  async delete(key: string): Promise<void> {
    const docId = this.encodeKey(key)
    await this.db.collection(this.collectionName).doc(docId).delete()
  }

  async list(prefix: string): Promise<string[]> {
    const encodedPrefix = this.encodeKey(prefix)
    const collection = this.db.collection(this.collectionName)

    // ドキュメント ID での範囲クエリ
    // prefix で始まるドキュメントを取得
    const snapshot = await collection
      .where(FieldPath.documentId(), '>=', encodedPrefix)
      .where(FieldPath.documentId(), '<', encodedPrefix + '\uf8ff')
      .get()

    const now = this.nowSeconds()
    const keys: string[] = []

    for (const doc of snapshot.docs) {
      const data = doc.data() as KVDocument

      // TTL チェック
      if (data.expiresAt && data.expiresAt < now) {
        continue // 期限切れはスキップ
      }

      keys.push(this.decodeKey(doc.id))
    }

    return keys
  }

  // ============================================
  // Private Methods
  // ============================================

  /**
   * キーをエンコード
   * Firestore ドキュメント ID の制約に対応
   * : → __, / → _-_
   */
  private encodeKey(key: string): string {
    return key.replace(/:/g, '__').replace(/\//g, '_-_')
  }

  /**
   * キーをデコード
   */
  private decodeKey(docId: string): string {
    return docId.replace(/_-_/g, '/').replace(/__/g, ':')
  }

  /**
   * 現在時刻（秒）
   */
  private nowSeconds(): number {
    return Math.floor(Date.now() / 1000)
  }
}
