import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { user } from './auth'
import { form, formField, formSchemaVersion, fieldCompletionCriteria } from './form'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * Submission テーブル
 * フォーム回答情報を格納
 */
export const submission = sqliteTable(
  'submission',
  {
    id: text('id').primaryKey(),
    formId: text('form_id')
      .notNull()
      .references(() => form.id, { onDelete: 'cascade' }),
    schemaVersionId: text('schema_version_id')
      .notNull()
      .references(() => formSchemaVersion.id),
    /** 回答者名（オプション） */
    respondentName: text('respondent_name'),
    /** 回答者メール（オプション） */
    respondentEmail: text('respondent_email'),
    language: text('language'),
    status: text('status').notNull().default('in_progress'),
    /** レビュー完了日時 */
    reviewCompletedAt: integer('review_completed_at', { mode: 'timestamp' }),
    consentCheckedAt: integer('consent_checked_at', { mode: 'timestamp' }),
    submittedAt: integer('submitted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('submission_form_status_created_idx').on(table.formId, table.status, table.createdAt),
  ]
)

/**
 * ChatSession テーブル
 * チャットセッション情報を格納
 * type: form_response
 */
export const chatSession = sqliteTable('chat_session', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').references(() => submission.id, { onDelete: 'cascade' }),
  formId: text('form_id').references(() => form.id, { onDelete: 'cascade' }),
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
  /** 情報収集プラン（JSON文字列） */
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
  targetFormFieldId: text('target_form_field_id').references(() => formField.id),
  reviewPassed: integer('review_passed', { mode: 'boolean' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

/**
 * SubmissionTask テーブル
 * 回答のタスク（completion criteria 追跡）
 */
export const submissionTask = sqliteTable('submission_task', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id')
    .notNull()
    .references(() => submission.id, { onDelete: 'cascade' }),
  fieldCompletionCriteriaId: text('field_completion_criteria_id')
    .notNull()
    .references(() => fieldCompletionCriteria.id),
  formFieldId: text('form_field_id')
    .notNull()
    .references(() => formField.id),
  /** 収集すべき情報の説明 */
  criteria: text('criteria').notNull(),
  /** 完了条件 */
  doneCondition: text('done_condition').notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  status: text('status').notNull().default('pending'),
  collectedValue: text('collected_value'),
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
export type Submission = InferSelectModel<typeof submission>
export type ChatSession = InferSelectModel<typeof chatSession>
export type ChatMessage = InferSelectModel<typeof chatMessage>
export type SubmissionTask = InferSelectModel<typeof submissionTask>
export type ToolCallLog = InferSelectModel<typeof toolCallLog>

// Insert 型
export type NewSubmission = InferInsertModel<typeof submission>
export type NewChatSession = InferInsertModel<typeof chatSession>
export type NewChatMessage = InferInsertModel<typeof chatMessage>
export type NewSubmissionTask = InferInsertModel<typeof submissionTask>
export type NewToolCallLog = InferInsertModel<typeof toolCallLog>
