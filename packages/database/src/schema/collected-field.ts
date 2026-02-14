import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { submission } from './submission'
import { formField } from './form'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * CollectedField テーブル
 * 収集されたフォームデータを格納
 */
export const collectedField = sqliteTable(
  'collected_field',
  {
    id: text('id').primaryKey(),
    submissionId: text('submission_id')
      .notNull()
      .references(() => submission.id, { onDelete: 'cascade' }),
    formFieldId: text('form_field_id')
      .notNull()
      .references(() => formField.id),
    value: text('value').notNull(),
    source: text('source').notNull().default('llm'),
    confirmed: integer('confirmed', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    uniqueIndex('collected_field_submission_field_idx').on(table.submissionId, table.formFieldId),
  ]
)

// Select 型
export type CollectedField = InferSelectModel<typeof collectedField>

// Insert 型
export type NewCollectedField = InferInsertModel<typeof collectedField>
