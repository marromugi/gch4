import type {
  Form,
  Submission,
  FormField,
  FormSchemaVersion,
  FieldCompletionCriteria,
  CollectedField,
  ConsentLog,
  EventLog,
  ChatSession,
  ChatMessage,
  SubmissionTask,
} from '@ding/domain/domain/entity'

export function serializeForm(form: Form) {
  return {
    id: form.id.value,
    title: form.title,
    description: form.description,
    purpose: form.purpose,
    completionMessage: form.completionMessage,
    status: form.status.value,
    createdBy: form.createdBy.value,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
  }
}

export function serializeFormWithCount(form: Form, submissionCount: number) {
  return {
    ...serializeForm(form),
    submissionCount,
  }
}

export function serializeSubmission(submission: Submission) {
  return {
    id: submission.id.value,
    formId: submission.formId.value,
    schemaVersionId: submission.schemaVersionId.value,
    respondentName: submission.respondentName,
    respondentEmail: submission.respondentEmail,
    language: submission.language,
    status: submission.status.value,
    reviewCompletedAt: submission.reviewCompletedAt?.toISOString() ?? null,
    consentCheckedAt: submission.consentCheckedAt?.toISOString() ?? null,
    submittedAt: submission.submittedAt?.toISOString() ?? null,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  }
}

export function serializeFormField(field: FormField) {
  return {
    id: field.id.value,
    formId: field.formId.value,
    fieldId: field.fieldId,
    label: field.label,
    description: field.description,
    intent: field.intent,
    required: field.required,
    sortOrder: field.sortOrder,
    createdAt: field.createdAt.toISOString(),
    updatedAt: field.updatedAt.toISOString(),
  }
}

export function serializeFormSchemaVersion(version: FormSchemaVersion) {
  return {
    id: version.id.value,
    formId: version.formId.value,
    version: version.version,
    status: version.status.value,
    approvedAt: version.approvedAt?.toISOString() ?? null,
    createdAt: version.createdAt.toISOString(),
  }
}

export function serializeFieldCompletionCriteria(criteria: FieldCompletionCriteria) {
  return {
    id: criteria.id.value,
    schemaVersionId: criteria.schemaVersionId.value,
    formFieldId: criteria.formFieldId.value,
    factKey: criteria.criteriaKey,
    fact: criteria.criteria,
    doneCriteria: criteria.doneCondition,
    questioningHints: criteria.questioningHints,
    boundaries: criteria.boundaries,
    sortOrder: criteria.sortOrder,
    createdAt: criteria.createdAt.toISOString(),
  }
}

export function serializeCollectedField(field: CollectedField) {
  return {
    id: field.id.value,
    submissionId: field.submissionId.value,
    formFieldId: field.formFieldId.value,
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
    submissionId: log.submissionId.value,
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
    formId: log.formId?.value ?? null,
    submissionId: log.submissionId?.value ?? null,
    chatSessionId: log.chatSessionId?.value ?? null,
    eventType: log.eventType.value,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString(),
  }
}

export function serializeChatSession(session: ChatSession) {
  return {
    id: session.id.value,
    submissionId: session.submissionId?.value ?? null,
    formId: session.formId?.value ?? null,
    type: session.type.value,
    bootstrapCompleted: session.bootstrapCompleted,
    status: session.status.value,
    turnCount: session.turnCount,
    currentAgent: session.currentAgent.value,
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
    targetFormFieldId: message.targetFormFieldId?.value ?? null,
    reviewPassed: message.reviewPassed,
    createdAt: message.createdAt.toISOString(),
  }
}

export function serializeSubmissionTask(task: SubmissionTask) {
  return {
    id: task.id.value,
    submissionId: task.submissionId.value,
    formFieldId: task.formFieldId.value,
    fact: task.criteria,
    doneCriteria: task.doneCondition,
    required: task.required,
    status: task.status.value,
    extractedValue: task.collectedValue,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
