import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { application, chatSession } from './application'
import { reviewPolicyVersion } from './policy'

/**
 * InterviewFeedback テーブル
 * 面談後フィードバックを格納
 * structuredData は JSON text（PoC）: evidence_facts, interpretations, uncertainty, followup_items, signal_status
 */
export const interviewFeedback = sqliteTable('interview_feedback', {
  id: text('id').primaryKey(),
  applicationId: text('application_id')
    .notNull()
    .references(() => application.id, { onDelete: 'cascade' }),
  chatSessionId: text('chat_session_id')
    .notNull()
    .references(() => chatSession.id),
  policyVersionId: text('policy_version_id')
    .notNull()
    .references(() => reviewPolicyVersion.id),
  structuredData: text('structured_data'),
  structuredSchemaVersion: integer('structured_schema_version').notNull().default(1),
  summaryConfirmedAt: integer('summary_confirmed_at', { mode: 'timestamp' }),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Select 型
export type InterviewFeedback = InferSelectModel<typeof interviewFeedback>

// Insert 型
export type NewInterviewFeedback = InferInsertModel<typeof interviewFeedback>
