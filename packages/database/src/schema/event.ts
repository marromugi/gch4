import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { submission, chatSession } from './submission'
import { form } from './form'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * EventLog テーブル
 * イベント計測を格納
 */
export const eventLog = sqliteTable('event_log', {
  id: text('id').primaryKey(),
  formId: text('form_id').references(() => form.id),
  submissionId: text('submission_id').references(() => submission.id),
  chatSessionId: text('chat_session_id').references(() => chatSession.id),
  eventType: text('event_type').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Select 型
export type EventLog = InferSelectModel<typeof eventLog>

// Insert 型
export type NewEventLog = InferInsertModel<typeof eventLog>
