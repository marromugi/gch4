import { z } from 'zod'

/**
 * 質問タイプ
 * - basic: 考える余地がない基本情報（氏名、メール、電話番号など）
 * - abstract: 深掘りが必要な質問（志望動機、価値観など）
 */
export const QuestionTypeSchema = z.enum(['basic', 'abstract'])

export type QuestionType = z.infer<typeof QuestionTypeSchema>

/**
 * プラン内のフィールド定義
 */
export const PlanFieldSchema = z.object({
  /** フィールドID */
  fieldId: z.string(),
  /** 表示ラベル */
  label: z.string(),
  /** 深掘り観点 */
  intent: z.string(),
  /** 必須フラグ */
  required: z.boolean(),
  /** 質問タイプ */
  questionType: QuestionTypeSchema,
  /** 質問タイプの判断理由（監査用） */
  questionTypeReason: z.string(),
  /** 推奨質問文 */
  suggestedQuestion: z.string().optional(),
  /** 収集すべきファクト */
  requiredFacts: z.array(z.string()).optional(),
})

export type PlanField = z.infer<typeof PlanFieldSchema>

/**
 * インタビュープラン全体
 */
export const PlanSchema = z.object({
  /** フィールドの配列（順序付き） */
  fields: z.array(PlanFieldSchema),
  /** プラン作成の概要説明 */
  summary: z.string(),
  /** 禁止トピック */
  prohibitedTopics: z.array(z.string()).optional(),
})

export type Plan = z.infer<typeof PlanSchema>
