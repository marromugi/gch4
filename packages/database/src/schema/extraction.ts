import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { application } from './application'
import { jobFormField } from './job'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * ExtractedField テーブル
 * 抽出されたフォームデータを格納
 */
export const extractedField = sqliteTable(
  'extracted_field',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => application.id, { onDelete: 'cascade' }),
    jobFormFieldId: text('job_form_field_id')
      .notNull()
      .references(() => jobFormField.id),
    value: text('value').notNull(),
    source: text('source').notNull().default('llm'),
    confirmed: integer('confirmed', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    uniqueIndex('extracted_field_app_field_idx').on(table.applicationId, table.jobFormFieldId),
  ]
)

// Select 型
export type ExtractedField = InferSelectModel<typeof extractedField>

// Insert 型
export type NewExtractedField = InferInsertModel<typeof extractedField>
