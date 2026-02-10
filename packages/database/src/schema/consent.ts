import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { application } from './application'

/**
 * ConsentLog テーブル
 * 同意ログを格納
 */
export const consentLog = sqliteTable('consent_log', {
  id: text('id').primaryKey(),
  applicationId: text('application_id')
    .notNull()
    .references(() => application.id, { onDelete: 'cascade' }),
  consentType: text('consent_type').notNull(),
  consented: integer('consented', { mode: 'boolean' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Select 型
export type ConsentLog = InferSelectModel<typeof consentLog>

// Insert 型
export type NewConsentLog = InferInsertModel<typeof consentLog>
