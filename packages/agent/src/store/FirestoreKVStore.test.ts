import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FirestoreKVStore } from './FirestoreKVStore'
import type {
  Firestore,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  Query,
} from 'firebase-admin/firestore'

// Firestore モック作成ヘルパー
function createMockFirestore() {
  const mockDoc = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  } as unknown as DocumentReference

  const mockQuery = {
    where: vi.fn(),
    get: vi.fn(),
  } as unknown as Query

  const mockCollection = {
    doc: vi.fn(() => mockDoc),
    where: vi.fn(() => mockQuery),
  } as unknown as CollectionReference

  const mockFirestore = {
    collection: vi.fn(() => mockCollection),
  } as unknown as Firestore

  // where チェーンを設定
  ;(mockQuery.where as ReturnType<typeof vi.fn>).mockReturnValue(mockQuery)

  return {
    firestore: mockFirestore,
    collection: mockCollection,
    doc: mockDoc,
    query: mockQuery,
  }
}

describe('FirestoreKVStore', () => {
  let kvStore: FirestoreKVStore
  let mocks: ReturnType<typeof createMockFirestore>

  beforeEach(() => {
    vi.clearAllMocks()
    mocks = createMockFirestore()
    kvStore = new FirestoreKVStore({
      firestore: mocks.firestore,
      collectionName: 'test-kv',
    })
  })

  describe('get', () => {
    it('存在しないキーは null を返す', async () => {
      const mockSnapshot = {
        exists: false,
        data: () => undefined,
      } as unknown as DocumentSnapshot
      ;(mocks.doc.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      const result = await kvStore.get('nonexistent')

      expect(result).toBeNull()
      expect(mocks.collection.doc).toHaveBeenCalledWith('nonexistent')
    })

    it('存在するキーの値をパースして返す', async () => {
      const testValue = { foo: 'bar', count: 42 }
      const mockSnapshot = {
        exists: true,
        data: () => ({
          value: JSON.stringify(testValue),
          expiresAt: null,
          createdAt: 1000000,
        }),
      } as unknown as DocumentSnapshot
      ;(mocks.doc.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      const result = await kvStore.get('test-key')

      expect(result).toEqual(testValue)
    })

    it('期限切れのキーは null を返し削除する', async () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 100
      const mockSnapshot = {
        exists: true,
        data: () => ({
          value: '"expired"',
          expiresAt: pastTimestamp,
          createdAt: 1000000,
        }),
      } as unknown as DocumentSnapshot
      ;(mocks.doc.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)
      ;(mocks.doc.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      const result = await kvStore.get('expired-key')

      expect(result).toBeNull()
      // 非同期削除が呼ばれることを確認
      expect(mocks.doc.delete).toHaveBeenCalled()
    })

    it('キーのエンコードが正しく行われる', async () => {
      const mockSnapshot = {
        exists: false,
        data: () => undefined,
      } as unknown as DocumentSnapshot
      ;(mocks.doc.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      await kvStore.get('session:abc:123')

      // : は __ にエンコードされる
      expect(mocks.collection.doc).toHaveBeenCalledWith('session__abc__123')
    })
  })

  describe('set', () => {
    it('TTL なしで値を保存する', async () => {
      ;(mocks.doc.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await kvStore.set('key', { data: 'value' })

      expect(mocks.doc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          value: JSON.stringify({ data: 'value' }),
          expiresAt: null,
        })
      )
    })

    it('TTL 付きで値を保存する', async () => {
      ;(mocks.doc.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
      const beforeSet = Math.floor(Date.now() / 1000)

      await kvStore.set('key', 'value', { expirationTtl: 3600 })

      const afterSet = Math.floor(Date.now() / 1000)
      expect(mocks.doc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          value: JSON.stringify('value'),
          expiresAt: expect.any(Number),
        })
      )

      // expiresAt が適切な範囲内にあることを確認
      const call = (mocks.doc.set as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.expiresAt).toBeGreaterThanOrEqual(beforeSet + 3600)
      expect(call.expiresAt).toBeLessThanOrEqual(afterSet + 3600)
    })

    it('キーのエンコードが正しく行われる', async () => {
      ;(mocks.doc.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await kvStore.set('session:abc/def', 'value')

      // : は __、/ は _-_ にエンコードされる
      expect(mocks.collection.doc).toHaveBeenCalledWith('session__abc_-_def')
    })
  })

  describe('delete', () => {
    it('キーを削除する', async () => {
      ;(mocks.doc.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await kvStore.delete('key')

      expect(mocks.doc.delete).toHaveBeenCalled()
    })

    it('キーのエンコードが正しく行われる', async () => {
      ;(mocks.doc.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

      await kvStore.delete('session:abc')

      expect(mocks.collection.doc).toHaveBeenCalledWith('session__abc')
    })
  })

  describe('list', () => {
    it('プレフィックスに一致するキーを返す', async () => {
      const mockDocs = [
        { id: 'session__abc', data: () => ({ expiresAt: null }) },
        { id: 'session__def', data: () => ({ expiresAt: null }) },
      ]
      const mockSnapshot = {
        docs: mockDocs,
      } as unknown as QuerySnapshot
      ;(mocks.query.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      const result = await kvStore.list('session:')

      expect(result).toEqual(['session:abc', 'session:def'])
    })

    it('期限切れのキーはフィルタリングされる', async () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 100
      const mockDocs = [
        { id: 'key1', data: () => ({ expiresAt: null }) },
        { id: 'key2', data: () => ({ expiresAt: pastTimestamp }) },
      ]
      const mockSnapshot = {
        docs: mockDocs,
      } as unknown as QuerySnapshot
      ;(mocks.query.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      const result = await kvStore.list('')

      expect(result).toEqual(['key1'])
    })

    it('範囲クエリが正しく構築される', async () => {
      const mockSnapshot = {
        docs: [],
      } as unknown as QuerySnapshot
      ;(mocks.query.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      await kvStore.list('session:')

      // where が2回呼ばれることを確認（>= と <）
      expect(mocks.collection.where).toHaveBeenCalledTimes(1)
      expect(mocks.query.where).toHaveBeenCalledTimes(1)
    })
  })

  describe('キーエンコード/デコード', () => {
    it('list で返されるキーは正しくデコードされる', async () => {
      const mockDocs = [
        { id: 'subsession__abc__0', data: () => ({ expiresAt: null }) },
        { id: 'path_-_to_-_key', data: () => ({ expiresAt: null }) },
      ]
      const mockSnapshot = {
        docs: mockDocs,
      } as unknown as QuerySnapshot
      ;(mocks.query.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      const result = await kvStore.list('')

      expect(result).toContain('subsession:abc:0')
      expect(result).toContain('path/to/key')
    })
  })

  describe('デフォルトコレクション名', () => {
    it('collectionName を指定しない場合は kv-store を使用する', async () => {
      const store = new FirestoreKVStore({ firestore: mocks.firestore })
      const mockSnapshot = {
        exists: false,
        data: () => undefined,
      } as unknown as DocumentSnapshot
      ;(mocks.doc.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapshot)

      await store.get('key')

      expect(mocks.firestore.collection).toHaveBeenCalledWith('kv-store')
    })
  })
})
