import type { Job } from '@ding/domain/domain/entity'
import type { Application } from '@ding/domain/domain/entity'
import type { JobFormField } from '@ding/domain/domain/entity'
import type { JobSchemaVersion } from '@ding/domain/domain/entity'
import type { FieldFactDefinition } from '@ding/domain/domain/entity'
import type { ProhibitedTopic } from '@ding/domain/domain/entity'
import type { ExtractedField } from '@ding/domain/domain/entity'
import type { ConsentLog } from '@ding/domain/domain/entity'
import type { EventLog } from '@ding/domain/domain/entity'
import type { InterviewFeedback } from '@ding/domain/domain/entity'
import type { ReviewPolicyVersion } from '@ding/domain/domain/entity'
import type { ReviewPolicySignal } from '@ding/domain/domain/entity'
import type { ReviewProhibitedTopic } from '@ding/domain/domain/entity'
import type { ChatSession } from '@ding/domain/domain/entity'
import type { ChatMessage } from '@ding/domain/domain/entity'
import type { ApplicationTodo } from '@ding/domain/domain/entity'

export function serializeJob(job: Job) {
  return {
    id: job.id.value,
    title: job.title,
    description: job.description,
    idealCandidate: job.idealCandidate,
    cultureContext: job.cultureContext,
    status: job.status.value,
    createdBy: job.createdBy.value,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }
}

export function serializeApplication(app: Application) {
  return {
    id: app.id.value,
    jobId: app.jobId.value,
    schemaVersionId: app.schemaVersionId.value,
    applicantName: app.applicantName,
    applicantEmail: app.applicantEmail,
    language: app.language,
    country: app.country,
    timezone: app.timezone,
    status: app.status.value,
    meetLink: app.meetLink,
    extractionReviewedAt: app.extractionReviewedAt?.toISOString() ?? null,
    consentCheckedAt: app.consentCheckedAt?.toISOString() ?? null,
    submittedAt: app.submittedAt?.toISOString() ?? null,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  }
}

export function serializeJobFormField(field: JobFormField) {
  return {
    id: field.id.value,
    jobId: field.jobId.value,
    fieldId: field.fieldId,
    label: field.label,
    intent: field.intent,
    required: field.required,
    sortOrder: field.sortOrder,
    createdAt: field.createdAt.toISOString(),
    updatedAt: field.updatedAt.toISOString(),
  }
}

export function serializeJobSchemaVersion(version: JobSchemaVersion) {
  return {
    id: version.id.value,
    jobId: version.jobId.value,
    version: version.version,
    status: version.status.value,
    approvedAt: version.approvedAt?.toISOString() ?? null,
    createdAt: version.createdAt.toISOString(),
  }
}

export function serializeFieldFactDefinition(def: FieldFactDefinition) {
  return {
    id: def.id.value,
    schemaVersionId: def.schemaVersionId.value,
    jobFormFieldId: def.jobFormFieldId.value,
    factKey: def.factKey,
    fact: def.fact,
    doneCriteria: def.doneCriteria,
    sortOrder: def.sortOrder,
    createdAt: def.createdAt.toISOString(),
  }
}

export function serializeProhibitedTopic(topic: ProhibitedTopic) {
  return {
    id: topic.id,
    schemaVersionId: topic.schemaVersionId.value,
    jobFormFieldId: topic.jobFormFieldId.value,
    topic: topic.topic,
    createdAt: topic.createdAt.toISOString(),
  }
}

export function serializeExtractedField(field: ExtractedField) {
  return {
    id: field.id.value,
    applicationId: field.applicationId.value,
    jobFormFieldId: field.jobFormFieldId.value,
    value: field.value,
    source: field.source.value,
    confirmed: field.confirmed,
    createdAt: field.createdAt.toISOString(),
    updatedAt: field.updatedAt.toISOString(),
  }
}

export function serializeConsentLog(log: ConsentLog) {
  return {
    id: log.id.value,
    applicationId: log.applicationId.value,
    consentType: log.consentType.value,
    consented: log.consented,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
  }
}

export function serializeEventLog(log: EventLog) {
  return {
    id: log.id.value,
    jobId: log.jobId?.value ?? null,
    applicationId: log.applicationId?.value ?? null,
    chatSessionId: log.chatSessionId?.value ?? null,
    policyVersionId: log.policyVersionId?.value ?? null,
    eventType: log.eventType.value,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString(),
  }
}

export function serializeInterviewFeedback(feedback: InterviewFeedback) {
  return {
    id: feedback.id.value,
    applicationId: feedback.applicationId.value,
    chatSessionId: feedback.chatSessionId.value,
    policyVersionId: feedback.policyVersionId.value,
    structuredData: feedback.structuredData,
    structuredSchemaVersion: feedback.structuredSchemaVersion,
    summaryConfirmedAt: feedback.summaryConfirmedAt?.toISOString() ?? null,
    submittedAt: feedback.submittedAt?.toISOString() ?? null,
    createdAt: feedback.createdAt.toISOString(),
    updatedAt: feedback.updatedAt.toISOString(),
  }
}

export function serializeReviewPolicyVersion(policy: ReviewPolicyVersion) {
  return {
    id: policy.id.value,
    jobId: policy.jobId.value,
    version: policy.version,
    status: policy.status.value,
    softCap: policy.softCap,
    hardCap: policy.hardCap,
    createdBy: policy.createdBy.value,
    confirmedAt: policy.confirmedAt?.toISOString() ?? null,
    publishedAt: policy.publishedAt?.toISOString() ?? null,
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString(),
  }
}

export function serializeReviewPolicySignal(signal: ReviewPolicySignal) {
  return {
    id: signal.id.value,
    policyVersionId: signal.policyVersionId.value,
    signalKey: signal.signalKey,
    label: signal.label,
    description: signal.description,
    priority: signal.priority.value,
    category: signal.category.value,
    sortOrder: signal.sortOrder,
    createdAt: signal.createdAt.toISOString(),
  }
}

export function serializeReviewProhibitedTopic(topic: ReviewProhibitedTopic) {
  return {
    id: topic.id,
    policyVersionId: topic.policyVersionId.value,
    topic: topic.topic,
    createdAt: topic.createdAt.toISOString(),
  }
}

export function serializeChatSession(session: ChatSession) {
  return {
    id: session.id.value,
    applicationId: session.applicationId?.value ?? null,
    jobId: session.jobId?.value ?? null,
    type: session.type.value,
    bootstrapCompleted: session.bootstrapCompleted,
    status: session.status.value,
    turnCount: session.turnCount,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  }
}

export function serializeChatMessage(message: ChatMessage) {
  return {
    id: message.id.value,
    chatSessionId: message.chatSessionId.value,
    role: message.role.value,
    content: message.content,
    targetJobFormFieldId: message.targetJobFormFieldId?.value ?? null,
    reviewPassed: message.reviewPassed,
    createdAt: message.createdAt.toISOString(),
  }
}

export function serializeApplicationTodo(todo: ApplicationTodo) {
  return {
    id: todo.id.value,
    applicationId: todo.applicationId.value,
    jobFormFieldId: todo.jobFormFieldId.value,
    fact: todo.fact,
    doneCriteria: todo.doneCriteria,
    required: todo.required,
    status: todo.status.value,
    extractedValue: todo.extractedValue,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  }
}
