import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { user } from './auth'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * Form テーブル
 * フォーム情報を格納
 */
export const form = sqliteTable('form', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  /** フォームの目的説明（AI生成の入力） */
  purpose: text('purpose'),
  /** 完了時メッセージ */
  completionMessage: text('completion_message'),
  status: text('status').notNull().default('draft'),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

/**
 * FormField テーブル
 * フォームの項目を格納
 */
export const formField = sqliteTable(
  'form_field',
  {
    id: text('id').primaryKey(),
    formId: text('form_id')
      .notNull()
      .references(() => form.id, { onDelete: 'cascade' }),
    fieldId: text('field_id').notNull(),
    label: text('label').notNull(),
    /** フィールドの説明 */
    description: text('description'),
    /** 深掘り観点 */
    intent: text('intent'),
    required: integer('required', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [uniqueIndex('form_field_form_id_field_id_idx').on(table.formId, table.fieldId)]
)

/**
 * FormSchemaVersion テーブル
 * フォームスキーマのバージョン管理
 */
export const formSchemaVersion = sqliteTable(
  'form_schema_version',
  {
    id: text('id').primaryKey(),
    formId: text('form_id')
      .notNull()
      .references(() => form.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    status: text('status').notNull().default('draft'),
    approvedAt: integer('approved_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    uniqueIndex('form_schema_version_form_id_version_idx').on(table.formId, table.version),
  ]
)

/**
 * FieldCompletionCriteria テーブル
 * LLM自動生成のフィールド完了条件定義（1 criteria = 1 行）
 */
export const fieldCompletionCriteria = sqliteTable(
  'field_completion_criteria',
  {
    id: text('id').primaryKey(),
    schemaVersionId: text('schema_version_id')
      .notNull()
      .references(() => formSchemaVersion.id, { onDelete: 'cascade' }),
    formFieldId: text('form_field_id')
      .notNull()
      .references(() => formField.id, { onDelete: 'cascade' }),
    criteriaKey: text('criteria_key').notNull(),
    /** 収集すべき情報の説明 */
    criteria: text('criteria').notNull(),
    /** 完了条件 */
    doneCondition: text('done_condition').notNull(),
    /** 質問ヒント */
    questioningHints: text('questioning_hints'),
    /** 聞いてはいけないこと（JSON配列） */
    boundaries: text('boundaries'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    uniqueIndex('field_completion_criteria_version_field_key_idx').on(
      table.schemaVersionId,
      table.formFieldId,
      table.criteriaKey
    ),
  ]
)

// Select 型
export type Form = InferSelectModel<typeof form>
export type FormField = InferSelectModel<typeof formField>
export type FormSchemaVersion = InferSelectModel<typeof formSchemaVersion>
export type FieldCompletionCriteria = InferSelectModel<typeof fieldCompletionCriteria>

// Insert 型
export type NewForm = InferInsertModel<typeof form>
export type NewFormField = InferInsertModel<typeof formField>
export type NewFormSchemaVersion = InferInsertModel<typeof formSchemaVersion>
export type NewFieldCompletionCriteria = InferInsertModel<typeof fieldCompletionCriteria>
