import type { ApplicationAgentContext } from '@ding/agent/agent'
import type {
  Application,
  Job,
  ChatSession,
  ChatMessage,
  ApplicationTodo as ApplicationTodoEntity,
  JobFormField,
  FieldFactDefinition,
  ProhibitedTopic,
} from '@ding/domain/domain/entity'

export function buildAgentContext(params: {
  application: Application
  job: Job
  session: ChatSession
  messages: ChatMessage[]
  todos: ApplicationTodoEntity[]
  formFields: JobFormField[]
  factDefinitions: FieldFactDefinition[]
  prohibitedTopics: ProhibitedTopic[]
}): ApplicationAgentContext {
  const {
    application,
    job,
    session,
    messages,
    todos,
    formFields,
    factDefinitions,
    prohibitedTopics,
  } = params

  // formFields → ApplicationAgentContext.formFields に変換
  const agentFormFields = formFields.map((ff) => {
    const fieldFacts = factDefinitions.filter((fd) => fd.jobFormFieldId.equals(ff.id))
    const fieldProhibited = prohibitedTopics.filter((pt) => pt.jobFormFieldId.equals(ff.id))

    return {
      fieldId: ff.id.value,
      label: ff.label,
      intent: ff.intent ?? '',
      required: ff.required,
      requiredFacts: fieldFacts.map((fd) => fd.fact),
      doneCriteria: fieldFacts.map((fd) => fd.doneCriteria),
      prohibitedTopics: fieldProhibited.map((pt) => pt.topic),
    }
  })

  // ApplicationTodo → Agent の ApplicationTodo に変換
  const agentTodos = todos.map((todo) => {
    const factDef = factDefinitions.find((fd) => fd.id.equals(todo.fieldFactDefinitionId))
    return {
      fieldId: todo.jobFormFieldId.value,
      factId: todo.fieldFactDefinitionId.value,
      description: todo.fact,
      status: todo.status.value,
      doneCriteria: todo.doneCriteria,
      questioningHints: factDef?.questioningHints ?? undefined,
    }
  })

  // ChatMessage → chatHistory (user/assistant のみ)
  const chatHistory = messages
    .filter((m) => m.role.isUser() || m.role.isAssistant())
    .map((m) => ({
      role: m.role.value as 'user' | 'assistant',
      content: m.content,
    }))

  return {
    type: 'application',
    sessionId: session.id.value,
    jobTitle: job.title,
    formFields: agentFormFields,
    todos: agentTodos,
    language: application.language ?? 'ja',
    residenceCountry: application.country ?? undefined,
    timezone: application.timezone ?? undefined,
    idealCandidate: job.idealCandidate ?? undefined,
    cultureContext: job.cultureContext ?? undefined,
    bootstrapCompleted: session.bootstrapCompleted,
    chatHistory,
    shouldFallback: session.shouldFallback(),
  }
}
