import { z } from '@hono/zod-openapi'

// ============================================================
// Form
// ============================================================
export const formResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  purpose: z.string().nullable(),
  completionMessage: z.string().nullable(),
  status: z.enum(['draft', 'published', 'closed']),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const formWithCountResponseSchema = formResponseSchema.extend({
  submissionCount: z.number(),
})

// ============================================================
// Submission
// ============================================================
export const submissionResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  schemaVersionId: z.string(),
  respondentName: z.string().nullable(),
  respondentEmail: z.string().nullable(),
  language: z.string().nullable(),
  status: z.enum(['new', 'in_progress', 'review_completed', 'submitted']),
  reviewCompletedAt: z.string().nullable(),
  consentCheckedAt: z.string().nullable(),
  submittedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// FormField
// ============================================================
export const formFieldResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  fieldId: z.string(),
  label: z.string(),
  intent: z.string().nullable(),
  required: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// FormSchemaVersion
// ============================================================
export const formSchemaVersionResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  version: z.number(),
  status: z.enum(['draft', 'approved']),
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
})

// ============================================================
// FieldCompletionCriteria
// ============================================================
export const fieldCompletionCriteriaResponseSchema = z.object({
  id: z.string(),
  schemaVersionId: z.string(),
  formFieldId: z.string(),
  factKey: z.string(),
  fact: z.string(),
  doneCriteria: z.string(),
  questioningHints: z.string().nullable(),
  boundaries: z.array(z.string()).nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
})

// ============================================================
// CollectedField
// ============================================================
export const collectedFieldResponseSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  formFieldId: z.string(),
  value: z.string(),
  source: z.enum(['llm', 'manual']),
  confirmed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// ConsentLog
// ============================================================
export const consentLogResponseSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  consentType: z.enum(['data_usage', 'privacy_policy']),
  consented: z.boolean(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
})

// ============================================================
// EventLog
// ============================================================
export const eventLogResponseSchema = z.object({
  id: z.string(),
  formId: z.string().nullable(),
  submissionId: z.string().nullable(),
  chatSessionId: z.string().nullable(),
  eventType: z.enum([
    'chat_started',
    'session_bootstrap_completed',
    'review_completed',
    'consent_checked',
    'submission_submitted',
    'manual_fallback_triggered',
  ]),
  metadata: z.string().nullable(),
  createdAt: z.string(),
})

// ============================================================
// ChatSession
// ============================================================
export const chatSessionResponseSchema = z.object({
  id: z.string(),
  submissionId: z.string().nullable(),
  formId: z.string().nullable(),
  type: z.enum(['form_response']),
  bootstrapCompleted: z.boolean(),
  status: z.enum(['active', 'completed']),
  turnCount: z.number(),
  currentAgent: z.enum(['greeter', 'architect', 'interviewer', 'reviewer']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// ChatMessage
// ============================================================
export const chatMessageResponseSchema = z.object({
  id: z.string(),
  chatSessionId: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  targetFormFieldId: z.string().nullable(),
  reviewPassed: z.boolean().nullable(),
  createdAt: z.string(),
})

// ============================================================
// SubmissionTask
// ============================================================
export const submissionTaskResponseSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  formFieldId: z.string(),
  fact: z.string(),
  doneCriteria: z.string(),
  required: z.boolean(),
  status: z.enum([
    'pending',
    'awaiting_answer',
    'validating',
    'needs_clarification',
    'done',
    'manual_input',
  ]),
  extractedValue: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// User (Better Auth)
// ============================================================
export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// Session (Better Auth)
// ============================================================
export const sessionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: z.string(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
