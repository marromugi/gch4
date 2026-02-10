import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { job } from './job'
import { application, chatSession } from './application'
import { reviewPolicyVersion } from './policy'

/**
 * EventLog テーブル
 * イベント計測を格納
 */
export const eventLog = sqliteTable('event_log', {
  id: text('id').primaryKey(),
  jobId: text('job_id').references(() => job.id),
  applicationId: text('application_id').references(() => application.id),
  chatSessionId: text('chat_session_id').references(() => chatSession.id),
  policyVersionId: text('policy_version_id').references(() => reviewPolicyVersion.id),
  eventType: text('event_type').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Select 型
export type EventLog = InferSelectModel<typeof eventLog>

// Insert 型
export type NewEventLog = InferInsertModel<typeof eventLog>
