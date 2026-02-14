import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { user } from './auth'
import { job } from './job'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

/**
 * ReviewPolicyVersion テーブル
 * 面談後レビュー用の企業方針バージョンを管理
 */
export const reviewPolicyVersion = sqliteTable(
  'review_policy_version',
  {
    id: text('id').primaryKey(),
    jobId: text('job_id')
      .notNull()
      .references(() => job.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    status: text('status').notNull().default('draft'),
    softCap: integer('soft_cap').notNull().default(6),
    hardCap: integer('hard_cap').notNull().default(10),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    confirmedAt: integer('confirmed_at', { mode: 'timestamp' }),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [uniqueIndex('review_policy_job_version_idx').on(table.jobId, table.version)]
)

/**
 * ReviewPolicySignal テーブル
 * 方針に紐づく観察シグナル（高優先/補助/懸念）
 */
export const reviewPolicySignal = sqliteTable(
  'review_policy_signal',
  {
    id: text('id').primaryKey(),
    policyVersionId: text('policy_version_id')
      .notNull()
      .references(() => reviewPolicyVersion.id, { onDelete: 'cascade' }),
    signalKey: text('signal_key').notNull(),
    label: text('label').notNull(),
    description: text('description'),
    priority: text('priority').notNull(),
    category: text('category').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [uniqueIndex('review_policy_signal_unique').on(table.policyVersionId, table.signalKey)]
)

/**
 * ReviewProhibitedTopic テーブル
 * レビュー方針に紐づく禁止トピック
 */
export const reviewProhibitedTopic = sqliteTable('review_prohibited_topic', {
  id: text('id').primaryKey(),
  policyVersionId: text('policy_version_id')
    .notNull()
    .references(() => reviewPolicyVersion.id, { onDelete: 'cascade' }),
  topic: text('topic').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Select 型
export type ReviewPolicyVersion = InferSelectModel<typeof reviewPolicyVersion>
export type ReviewPolicySignal = InferSelectModel<typeof reviewPolicySignal>
export type ReviewProhibitedTopic = InferSelectModel<typeof reviewProhibitedTopic>

// Insert 型
export type NewReviewPolicyVersion = InferInsertModel<typeof reviewPolicyVersion>
export type NewReviewPolicySignal = InferInsertModel<typeof reviewPolicySignal>
export type NewReviewProhibitedTopic = InferInsertModel<typeof reviewProhibitedTopic>
