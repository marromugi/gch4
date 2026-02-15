import { z } from '@hono/zod-openapi'

// ============================================================
// OrchestratorV3 Stages
// ============================================================
export const orchestratorStageSchema = z.enum([
  'BOOTSTRAP',
  'INTERVIEW_LOOP',
  'FINAL_AUDIT',
  'COMPLETED',
])

// ============================================================
// Request Schemas
// ============================================================
export const createV3SessionRequestSchema = z.object({
  formId: z.string().uuid(),
  /** ブラウザの言語設定（navigator.language から取得、例: 'ja', 'en', 'zh', 'ko'） */
  browserLanguage: z.string().optional(),
})

export const sendV3MessageRequestSchema = z.object({
  message: z.string().min(1),
})

// ============================================================
// Response Schemas
// ============================================================

/**
 * ask_options レスポンス用のスキーマ
 */
export const askOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
})

export const askOptionsDataSchema = z.object({
  options: z.array(askOptionSchema),
  selectionType: z.enum(['radio', 'checkbox']),
})

export const v3SessionCreatedResponseSchema = z.object({
  sessionId: z.string().uuid(),
  greeting: z.string().nullable(),
  stage: orchestratorStageSchema,
  askOptions: askOptionsDataSchema.optional(),
})

export const v3MessageResponseSchema = z.object({
  response: z.string().nullable(),
  stage: orchestratorStageSchema,
  isComplete: z.boolean(),
  collectedFields: z.record(z.string(), z.string()).optional(),
  askOptions: askOptionsDataSchema.optional(),
})

export const v3SessionStatusResponseSchema = z.object({
  sessionId: z.string().uuid(),
  stage: orchestratorStageSchema,
  isComplete: z.boolean(),
  collectedFields: z.record(z.string(), z.string()),
  progress: z.object({
    completed: z.number(),
    total: z.number(),
  }),
})

/**
 * LLMエラー時のフォールバックレスポンススキーマ
 * 収集済みデータと未収集フィールドIDを含む
 */
export const v3LlmErrorResponseSchema = z.object({
  error: z.string(),
  errorType: z.literal('LLM_ERROR'),
  collectedFields: z.record(z.string(), z.string()),
  remainingFieldIds: z.array(z.string()),
  currentStage: orchestratorStageSchema,
})
