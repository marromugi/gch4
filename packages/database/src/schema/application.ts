import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { user } from './auth'
import { job, jobFormField, jobSchemaVersion, fieldFactDefinition } from './job'
import { reviewPolicyVersion, reviewPolicySignal } from './policy'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * Application テーブル
 * 応募情報を格納
 */
export const application = sqliteTable(
  'application',
  {
    id: text('id').primaryKey(),
    jobId: text('job_id')
      .notNull()
      .references(() => job.id, { onDelete: 'cascade' }),
    schemaVersionId: text('schema_version_id')
      .notNull()
      .references(() => jobSchemaVersion.id),
    applicantName: text('applicant_name'),
    applicantEmail: text('applicant_email'),
    language: text('language'),
    country: text('country'),
    timezone: text('timezone'),
    status: text('status').notNull().default('new'),
    meetLink: text('meet_link'),
    extractionReviewedAt: integer('extraction_reviewed_at', { mode: 'timestamp' }),
    consentCheckedAt: integer('consent_checked_at', { mode: 'timestamp' }),
    submittedAt: integer('submitted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('application_job_status_created_idx').on(table.jobId, table.status, table.createdAt),
  ]
)

/**
 * ChatSession テーブル
 * チャットセッション情報を格納
 * type: application / interview_feedback / policy_creation
 * - application: applicationId 必須
 * - interview_feedback: applicationId 必須, policyVersionId 必須
 * - policy_creation: jobId 必須
 */
export const chatSession = sqliteTable('chat_session', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').references(() => application.id, { onDelete: 'cascade' }),
  jobId: text('job_id').references(() => job.id, { onDelete: 'cascade' }),
  policyVersionId: text('policy_version_id').references(() => reviewPolicyVersion.id),
  type: text('type').notNull(),
  conductorId: text('conductor_id').references(() => user.id),
  bootstrapCompleted: integer('bootstrap_completed', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('active'),
  turnCount: integer('turn_count').notNull().default(0),
  softCap: integer('soft_cap'),
  hardCap: integer('hard_cap'),
  softCappedAt: integer('soft_capped_at', { mode: 'timestamp' }),
  hardCappedAt: integer('hard_capped_at', { mode: 'timestamp' }),
  reviewFailStreak: integer('review_fail_streak').notNull().default(0),
  extractionFailStreak: integer('extraction_fail_streak').notNull().default(0),
  timeoutStreak: integer('timeout_streak').notNull().default(0),
  currentAgent: text('current_agent').notNull().default('greeter'),
  /** インタビュープラン（JSON文字列） */
  plan: text('plan'),
  /** プランスキーマバージョン */
  planSchemaVersion: integer('plan_schema_version'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

/**
 * ChatMessage テーブル
 * チャットメッセージを格納
 */
export const chatMessage = sqliteTable('chat_message', {
  id: text('id').primaryKey(),
  chatSessionId: text('chat_session_id')
    .notNull()
    .references(() => chatSession.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  targetJobFormFieldId: text('target_job_form_field_id').references(() => jobFormField.id),
  targetReviewSignalId: text('target_review_signal_id').references(() => reviewPolicySignal.id),
  reviewPassed: integer('review_passed', { mode: 'boolean' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

/**
 * ApplicationTodo テーブル
 * 応募のTodo（required_fact追跡）
 */
export const applicationTodo = sqliteTable('application_todo', {
  id: text('id').primaryKey(),
  applicationId: text('application_id')
    .notNull()
    .references(() => application.id, { onDelete: 'cascade' }),
  fieldFactDefinitionId: text('field_fact_definition_id')
    .notNull()
    .references(() => fieldFactDefinition.id),
  jobFormFieldId: text('job_form_field_id')
    .notNull()
    .references(() => jobFormField.id),
  fact: text('fact').notNull(),
  doneCriteria: text('done_criteria').notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  status: text('status').notNull().default('pending'),
  extractedValue: text('extracted_value'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

/**
 * ToolCallLog テーブル
 * ツール呼び出しログ（Event Sourcing用、サブセッション復元に使用）
 */
export const toolCallLog = sqliteTable(
  'tool_call_log',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => chatSession.id, { onDelete: 'cascade' }),
    /** ログの順序（セッション内で一意） */
    sequence: integer('sequence').notNull(),
    /** 実行したエージェント */
    agent: text('agent').notNull(),
    /** ツール名 */
    toolName: text('tool_name').notNull(),
    /** ツールの引数（JSON文字列） */
    args: text('args').notNull(),
    /** ツールの結果（JSON文字列） */
    result: text('result'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [index('tool_call_log_session_sequence_idx').on(table.sessionId, table.sequence)]
)

// Select 型
export type Application = InferSelectModel<typeof application>
export type ChatSession = InferSelectModel<typeof chatSession>
export type ChatMessage = InferSelectModel<typeof chatMessage>
export type ApplicationTodo = InferSelectModel<typeof applicationTodo>
export type ToolCallLog = InferSelectModel<typeof toolCallLog>

// Insert 型
export type NewApplication = InferInsertModel<typeof application>
export type NewChatSession = InferInsertModel<typeof chatSession>
export type NewChatMessage = InferInsertModel<typeof chatMessage>
export type NewApplicationTodo = InferInsertModel<typeof applicationTodo>
export type NewToolCallLog = InferInsertModel<typeof toolCallLog>
