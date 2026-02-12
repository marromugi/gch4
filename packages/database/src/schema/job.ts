import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { user } from './auth'

/**
 * Job テーブル
 * 求人情報を格納
 */
export const job = sqliteTable('job', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  idealCandidate: text('ideal_candidate'),
  cultureContext: text('culture_context'),
  status: text('status').notNull().default('draft'),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

/**
 * JobFormField テーブル
 * 求人フォームの項目を格納
 */
export const jobFormField = sqliteTable(
  'job_form_field',
  {
    id: text('id').primaryKey(),
    jobId: text('job_id')
      .notNull()
      .references(() => job.id, { onDelete: 'cascade' }),
    fieldId: text('field_id').notNull(),
    label: text('label').notNull(),
    intent: text('intent'),
    required: integer('required', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [uniqueIndex('job_form_field_job_id_field_id_idx').on(table.jobId, table.fieldId)]
)

/**
 * JobSchemaVersion テーブル
 * 求人スキーマのバージョン管理
 */
export const jobSchemaVersion = sqliteTable(
  'job_schema_version',
  {
    id: text('id').primaryKey(),
    jobId: text('job_id')
      .notNull()
      .references(() => job.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    status: text('status').notNull().default('draft'),
    approvedAt: integer('approved_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [uniqueIndex('job_schema_version_job_id_version_idx').on(table.jobId, table.version)]
)

/**
 * FieldFactDefinition テーブル
 * LLM自動生成のフィールドFact定義（1 fact = 1 行）
 */
export const fieldFactDefinition = sqliteTable(
  'field_fact_definition',
  {
    id: text('id').primaryKey(),
    schemaVersionId: text('schema_version_id')
      .notNull()
      .references(() => jobSchemaVersion.id, { onDelete: 'cascade' }),
    jobFormFieldId: text('job_form_field_id')
      .notNull()
      .references(() => jobFormField.id, { onDelete: 'cascade' }),
    factKey: text('fact_key').notNull(),
    fact: text('fact').notNull(),
    doneCriteria: text('done_criteria').notNull(),
    questioningHints: text('questioning_hints'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    uniqueIndex('field_fact_def_version_field_key_idx').on(
      table.schemaVersionId,
      table.jobFormFieldId,
      table.factKey
    ),
  ]
)

/**
 * ProhibitedTopic テーブル
 * 禁止トピック
 */
export const prohibitedTopic = sqliteTable('prohibited_topic', {
  id: text('id').primaryKey(),
  schemaVersionId: text('schema_version_id')
    .notNull()
    .references(() => jobSchemaVersion.id, { onDelete: 'cascade' }),
  jobFormFieldId: text('job_form_field_id')
    .notNull()
    .references(() => jobFormField.id, { onDelete: 'cascade' }),
  topic: text('topic').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Select 型
export type Job = InferSelectModel<typeof job>
export type JobFormField = InferSelectModel<typeof jobFormField>
export type JobSchemaVersion = InferSelectModel<typeof jobSchemaVersion>
export type FieldFactDefinition = InferSelectModel<typeof fieldFactDefinition>
export type ProhibitedTopic = InferSelectModel<typeof prohibitedTopic>

// Insert 型
export type NewJob = InferInsertModel<typeof job>
export type NewJobFormField = InferInsertModel<typeof jobFormField>
export type NewJobSchemaVersion = InferInsertModel<typeof jobSchemaVersion>
export type NewFieldFactDefinition = InferInsertModel<typeof fieldFactDefinition>
export type NewProhibitedTopic = InferInsertModel<typeof prohibitedTopic>
