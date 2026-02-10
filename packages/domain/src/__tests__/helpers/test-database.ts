import { createDatabase, type Database } from '@ding/database/client'
import {
  user,
  tweet,
  tweetTag,
  tweetEmbedding,
  appointment,
  wish,
  tweetAppointment,
  tweetWish,
  action,
} from '@ding/database/schema'

const TEST_DATABASE_URL = 'http://127.0.0.1:8082'

/**
 * テスト用データベース接続を作成
 */
export function createTestDatabase(): Database {
  return createDatabase({ DATABASE_URL: TEST_DATABASE_URL })
}

/**
 * 全テーブルのデータをクリア（FK 制約順に子テーブルから削除）
 */
export async function cleanDatabase(db: Database): Promise<void> {
  await db.delete(action)
  await db.delete(tweetAppointment)
  await db.delete(tweetWish)
  await db.delete(tweetEmbedding)
  await db.delete(tweetTag)
  await db.delete(tweet)
  await db.delete(appointment)
  await db.delete(wish)
  await db.delete(user)
}

/**
 * テスト用ユーザーレコードを挿入
 */
export async function insertTestUser(
  db: Database,
  data: {
    id: string
    name?: string
    email?: string
  }
): Promise<void> {
  const now = new Date()
  await db.insert(user).values({
    id: data.id,
    name: data.name ?? `Test User ${data.id}`,
    email: data.email ?? `${data.id}@test.example.com`,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  })
}

/**
 * テスト用 Tweet レコードを挿入
 */
export async function insertTestTweet(
  db: Database,
  data: {
    id: string
    userId: string
    content?: string
    author?: 'user' | 'bud'
    replyToId?: string
  }
): Promise<void> {
  const now = new Date()
  await db.insert(tweet).values({
    id: data.id,
    userId: data.userId,
    content: data.content ?? 'Test tweet',
    author: data.author ?? 'user',
    replyToId: data.replyToId ?? null,
    context: null,
    processedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  })
}
