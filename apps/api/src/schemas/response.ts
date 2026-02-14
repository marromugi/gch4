import { z } from '@hono/zod-openapi'

// ============================================================
// Job
// ============================================================
export const jobResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  idealCandidate: z.string().nullable(),
  cultureContext: z.string().nullable(),
  status: z.enum(['draft', 'open', 'closed']),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// Application
// ============================================================
export const applicationResponseSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  schemaVersionId: z.string(),
  applicantName: z.string().nullable(),
  applicantEmail: z.string().nullable(),
  language: z.string().nullable(),
  country: z.string().nullable(),
  timezone: z.string().nullable(),
  status: z.enum(['new', 'scheduling', 'interviewed', 'closed']),
  meetLink: z.string().nullable(),
  extractionReviewedAt: z.string().nullable(),
  consentCheckedAt: z.string().nullable(),
  submittedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// JobFormField
// ============================================================
export const jobFormFieldResponseSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  fieldId: z.string(),
  label: z.string(),
  intent: z.string().nullable(),
  required: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// JobSchemaVersion
// ============================================================
export const jobSchemaVersionResponseSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  version: z.number(),
  status: z.enum(['draft', 'approved']),
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
})

// ============================================================
// FieldFactDefinition
// ============================================================
export const fieldFactDefinitionResponseSchema = z.object({
  id: z.string(),
  schemaVersionId: z.string(),
  jobFormFieldId: z.string(),
  factKey: z.string(),
  fact: z.string(),
  doneCriteria: z.string(),
  sortOrder: z.number(),
  createdAt: z.string(),
})

// ============================================================
// ProhibitedTopic (Job Schema)
// ============================================================
export const prohibitedTopicResponseSchema = z.object({
  id: z.string(),
  schemaVersionId: z.string(),
  jobFormFieldId: z.string(),
  topic: z.string(),
  createdAt: z.string(),
})

// ============================================================
// ExtractedField
// ============================================================
export const extractedFieldResponseSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  jobFormFieldId: z.string(),
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
  applicationId: z.string(),
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
  jobId: z.string().nullable(),
  applicationId: z.string().nullable(),
  chatSessionId: z.string().nullable(),
  policyVersionId: z.string().nullable(),
  eventType: z.enum([
    'chat_started',
    'session_bootstrap_completed',
    'extraction_reviewed',
    'consent_checked',
    'application_submitted',
    'manual_fallback_triggered',
    'policy_draft_started',
    'policy_draft_confirmed',
    'policy_version_published',
    'review_chat_started',
    'review_turn_soft_capped',
    'review_turn_hard_capped',
    'review_summary_confirmed',
    'review_submitted',
    'review_manual_fallback_triggered',
  ]),
  metadata: z.string().nullable(),
  createdAt: z.string(),
})

// ============================================================
// InterviewFeedback
// ============================================================
export const interviewFeedbackResponseSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  chatSessionId: z.string(),
  policyVersionId: z.string(),
  structuredData: z.string().nullable(),
  structuredSchemaVersion: z.number(),
  summaryConfirmedAt: z.string().nullable(),
  submittedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// ReviewPolicyVersion
// ============================================================
export const reviewPolicyVersionResponseSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  version: z.number(),
  status: z.enum(['draft', 'confirmed', 'published']),
  softCap: z.number(),
  hardCap: z.number(),
  createdBy: z.string(),
  confirmedAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ============================================================
// ReviewPolicySignal
// ============================================================
export const reviewPolicySignalResponseSchema = z.object({
  id: z.string(),
  policyVersionId: z.string(),
  signalKey: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  priority: z.enum(['high', 'supporting', 'concern']),
  category: z.enum(['must', 'ng', 'nice']),
  sortOrder: z.number(),
  createdAt: z.string(),
})

// ============================================================
// ReviewProhibitedTopic
// ============================================================
export const reviewProhibitedTopicResponseSchema = z.object({
  id: z.string(),
  policyVersionId: z.string(),
  topic: z.string(),
  createdAt: z.string(),
})

// ============================================================
// ChatSession
// ============================================================
export const chatSessionResponseSchema = z.object({
  id: z.string(),
  applicationId: z.string().nullable(),
  jobId: z.string().nullable(),
  type: z.enum(['application', 'interview_feedback', 'policy_creation']),
  bootstrapCompleted: z.boolean(),
  status: z.enum(['active', 'completed']),
  turnCount: z.number(),
  currentAgent: z.enum([
    'greeter',
    'architect',
    'interviewer',
    'explorer',
    'reviewer',
    'quick_check',
    'auditor',
  ]),
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
  targetJobFormFieldId: z.string().nullable(),
  reviewPassed: z.boolean().nullable(),
  createdAt: z.string(),
})

// ============================================================
// ApplicationTodo
// ============================================================
export const applicationTodoResponseSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  jobFormFieldId: z.string(),
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
