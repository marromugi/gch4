import type { ApplicationAgentTurnResult, TodoUpdate } from '@ding/agent/agent'
import { ChatMessage } from '@ding/domain/domain/entity'
import { EventLog } from '@ding/domain/domain/entity'
import { ExtractedField } from '@ding/domain/domain/entity'
import type { Application } from '@ding/domain/domain/entity'
import type { ChatSession } from '@ding/domain/domain/entity'
import type { ApplicationTodo } from '@ding/domain/domain/entity'
import { ChatMessageId } from '@ding/domain/domain/valueObject'
import { ChatMessageRole } from '@ding/domain/domain/valueObject'
import { EventLogId } from '@ding/domain/domain/valueObject'
import { EventType } from '@ding/domain/domain/valueObject'
import { ExtractedFieldId } from '@ding/domain/domain/valueObject'
import { ExtractedFieldSource } from '@ding/domain/domain/valueObject'
import { JobFormFieldId } from '@ding/domain/domain/valueObject'
import { TodoStatus } from '@ding/domain/domain/valueObject'
import type { Repositories } from '../../../../../../../types/repositories'

/**
 * Agent の TodoUpdate をドメインエンティティに適用する。
 * ドメインの状態遷移制約を満たすために中間ステップを自動挿入する。
 */
function applyAgentTodoUpdate(todo: ApplicationTodo, update: TodoUpdate): ApplicationTodo {
  if (update.newStatus === 'done' && update.extractedValue) {
    let t = todo
    if (t.status.isPending()) t = t.transitionTo(TodoStatus.awaitingAnswer())
    if (t.status.isAwaitingAnswer()) t = t.transitionTo(TodoStatus.validating())
    return t.markDone(update.extractedValue)
  }

  if (update.newStatus === 'needs_clarification') {
    let t = todo
    if (t.status.isPending()) t = t.transitionTo(TodoStatus.awaitingAnswer())
    if (t.status.isAwaitingAnswer()) t = t.transitionTo(TodoStatus.validating())
    return t.transitionTo(TodoStatus.needsClarification())
  }

  if (update.newStatus === 'manual_input') {
    return todo.fallbackToManualInput()
  }

  if (update.newStatus === 'awaiting_answer') {
    let t = todo
    if (t.status.isNeedsClarification()) t = t.transitionTo(TodoStatus.awaitingAnswer())
    else if (t.status.isPending()) t = t.transitionTo(TodoStatus.awaitingAnswer())
    return t
  }

  return todo.transitionTo(TodoStatus.from(update.newStatus))
}

export interface ProcessAgentResultParams {
  result: ApplicationAgentTurnResult
  session: ChatSession
  application: Application
  todos: ApplicationTodo[]
  existingExtractedFields: ExtractedField[]
  userMessage: string
  repositories: Repositories
}

export interface ProcessAgentResultOutput {
  assistantMessage: ChatMessage
  updatedSession: ChatSession
  updatedTodos: ApplicationTodo[]
  updatedApplication: Application
}

export async function processAgentResult(
  params: ProcessAgentResultParams
): Promise<ProcessAgentResultOutput> {
  const {
    result,
    session,
    application,
    todos,
    existingExtractedFields,
    userMessage,
    repositories,
  } = params

  const now = new Date()

  // 1. ユーザーメッセージ保存
  const userMsg = ChatMessage.create({
    id: ChatMessageId.fromString(crypto.randomUUID()),
    chatSessionId: session.id,
    role: ChatMessageRole.user(),
    content: userMessage,
    targetJobFormFieldId: null,
    targetReviewSignalId: null,
    reviewPassed: null,
    createdAt: now,
  })
  await repositories.applicationRepository.saveChatMessage(userMsg)

  // 2. アシスタントメッセージ保存
  const assistantMsg = ChatMessage.create({
    id: ChatMessageId.fromString(crypto.randomUUID()),
    chatSessionId: session.id,
    role: ChatMessageRole.assistant(),
    content: result.responseText,
    targetJobFormFieldId: null,
    targetReviewSignalId: null,
    reviewPassed: result.reviewPassed ?? null,
    createdAt: now,
  })
  await repositories.applicationRepository.saveChatMessage(assistantMsg)

  // 3. セッション更新
  let updatedSession = session.incrementTurnCount()

  // ストリーク処理
  if (result.error) {
    switch (result.error.type) {
      case 'extraction_failed':
        updatedSession = updatedSession.incrementExtractionFailStreak()
        break
      case 'timeout':
        updatedSession = updatedSession.incrementTimeoutStreak()
        break
      case 'review_failed':
        updatedSession = updatedSession.incrementReviewFailStreak()
        break
    }
  } else {
    updatedSession = updatedSession.resetExtractionFailStreak()
    updatedSession = updatedSession.resetTimeoutStreak()
  }

  if (result.reviewPassed === false) {
    updatedSession = updatedSession.incrementReviewFailStreak()
  } else if (result.reviewPassed === true) {
    updatedSession = updatedSession.resetReviewFailStreak()
  }

  // Bootstrap 完了
  let updatedApplication = application
  if (result.bootstrapData?.completed && !session.bootstrapCompleted) {
    updatedSession = updatedSession.completeBootstrap()

    const lang = result.bootstrapData.language ?? 'ja'
    const country = result.bootstrapData.residenceCountry ?? ''
    const tz = result.bootstrapData.timezone ?? ''
    updatedApplication = updatedApplication.setBootstrapInfo(lang, country, tz)
    await repositories.applicationRepository.save(updatedApplication)

    // EventLog: bootstrap completed
    const bootstrapEvent = EventLog.create({
      id: EventLogId.fromString(crypto.randomUUID()),
      jobId: application.jobId,
      applicationId: application.id,
      chatSessionId: session.id,
      policyVersionId: null,
      eventType: EventType.sessionBootstrapCompleted(),
      metadata: null,
      createdAt: now,
    })
    await repositories.eventLogRepository.create(bootstrapEvent)
  }

  // セッション完了
  if (result.isComplete) {
    updatedSession = updatedSession.complete()
  }

  await repositories.applicationRepository.saveChatSession(updatedSession)

  // 4. Todo 更新
  const updatedTodos = [...todos]
  for (const todoUpdate of result.todoUpdates) {
    const idx = updatedTodos.findIndex((t) => t.fieldFactDefinitionId.value === todoUpdate.factId)
    if (idx === -1) continue
    updatedTodos[idx] = applyAgentTodoUpdate(updatedTodos[idx], todoUpdate)
    await repositories.applicationRepository.saveTodo(updatedTodos[idx])
  }

  // 5. ExtractedField 保存
  for (const extracted of result.extractedFacts) {
    const existing = existingExtractedFields.find(
      (ef) => ef.jobFormFieldId.value === extracted.fieldId
    )
    if (existing) {
      const updated = existing.updateValue(extracted.value, ExtractedFieldSource.llm())
      await repositories.applicationRepository.saveExtractedField(updated)
    } else {
      const newField = ExtractedField.create({
        id: ExtractedFieldId.fromString(crypto.randomUUID()),
        applicationId: application.id,
        jobFormFieldId: JobFormFieldId.fromString(extracted.fieldId),
        value: extracted.value,
        source: ExtractedFieldSource.llm(),
        confirmed: false,
        createdAt: now,
        updatedAt: now,
      })
      await repositories.applicationRepository.saveExtractedField(newField)
    }
  }

  // 6. Fallback フェーズの EventLog
  if (result.phase === 'fallback') {
    const fallbackEvent = EventLog.create({
      id: EventLogId.fromString(crypto.randomUUID()),
      jobId: application.jobId,
      applicationId: application.id,
      chatSessionId: session.id,
      policyVersionId: null,
      eventType: EventType.manualFallbackTriggered(),
      metadata: null,
      createdAt: now,
    })
    await repositories.eventLogRepository.create(fallbackEvent)
  }

  return {
    assistantMessage: assistantMsg,
    updatedSession,
    updatedTodos,
    updatedApplication,
  }
}
