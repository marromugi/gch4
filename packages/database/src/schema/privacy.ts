import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { application } from './application'

/**
 * PrivacyRequest テーブル
 * データ保護リクエストを格納
 */
export const privacyRequest = sqliteTable('privacy_request', {
  id: text('id').primaryKey(),
  applicationId: text('application_id')
    .notNull()
    .references(() => application.id, { onDelete: 'cascade' }),
  requestType: text('request_type').notNull(),
  status: text('status').notNull().default('pending'),
  requestedAt: integer('requested_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Select 型
export type PrivacyRequest = InferSelectModel<typeof privacyRequest>

// Insert 型
export type NewPrivacyRequest = InferInsertModel<typeof privacyRequest>
