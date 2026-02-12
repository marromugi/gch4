import { createDatabase, type Database } from '@ding/database/client'
import {
  user,
  eventLog,
  interviewFeedback,
  chatMessage,
  applicationTodo,
  extractedField,
  consentLog,
  chatSession,
  application,
  fieldFactDefinition,
  prohibitedTopic,
  jobSchemaVersion,
  reviewProhibitedTopic,
  reviewPolicySignal,
  reviewPolicyVersion,
  jobFormField,
  job,
  privacyRequest,
  session,
  account,
  verification,
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
  await db.delete(eventLog)
  await db.delete(interviewFeedback)
  await db.delete(chatMessage)
  await db.delete(applicationTodo)
  await db.delete(extractedField)
  await db.delete(consentLog)
  await db.delete(chatSession)
  await db.delete(privacyRequest)
  await db.delete(application)
  await db.delete(fieldFactDefinition)
  await db.delete(prohibitedTopic)
  await db.delete(jobSchemaVersion)
  await db.delete(reviewProhibitedTopic)
  await db.delete(reviewPolicySignal)
  await db.delete(reviewPolicyVersion)
  await db.delete(jobFormField)
  await db.delete(job)
  await db.delete(session)
  await db.delete(account)
  await db.delete(verification)
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
