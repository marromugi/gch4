import type { Result } from '../../shared/Result/Result'
import type { Application } from '../../entity/Application/Application'
import type { ApplicationTodo } from '../../entity/ApplicationTodo/ApplicationTodo'
import type { ExtractedField } from '../../entity/ExtractedField/ExtractedField'
import type { ConsentLog } from '../../entity/ConsentLog/ConsentLog'
import type { ChatSession } from '../../entity/ChatSession/ChatSession'
import type { ChatMessage } from '../../entity/ChatMessage/ChatMessage'
import type { ApplicationId } from '../../valueObject/ApplicationId/ApplicationId'
import type { JobId } from '../../valueObject/JobId/JobId'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { ApplicationStatus } from '../../valueObject/ApplicationStatus/ApplicationStatus'

export interface IApplicationRepository {
  findById(id: ApplicationId): Promise<Result<Application, Error>>
  findByJobId(jobId: JobId): Promise<Result<Application[], Error>>
  findByJobIdAndStatus(
    jobId: JobId,
    status: ApplicationStatus
  ): Promise<Result<Application[], Error>>
  save(application: Application): Promise<Result<void, Error>>
  delete(id: ApplicationId): Promise<Result<void, Error>>

  // ApplicationTodo
  findTodosByApplicationId(applicationId: ApplicationId): Promise<Result<ApplicationTodo[], Error>>
  saveTodo(todo: ApplicationTodo): Promise<Result<void, Error>>
  saveTodos(todos: ApplicationTodo[]): Promise<Result<void, Error>>

  // ExtractedField
  findExtractedFieldsByApplicationId(
    applicationId: ApplicationId
  ): Promise<Result<ExtractedField[], Error>>
  saveExtractedField(field: ExtractedField): Promise<Result<void, Error>>
  saveExtractedFields(fields: ExtractedField[]): Promise<Result<void, Error>>

  // ConsentLog
  findConsentLogsByApplicationId(applicationId: ApplicationId): Promise<Result<ConsentLog[], Error>>
  saveConsentLog(log: ConsentLog): Promise<Result<void, Error>>

  // ChatSession
  findChatSessionsByApplicationId(
    applicationId: ApplicationId
  ): Promise<Result<ChatSession[], Error>>
  saveChatSession(session: ChatSession): Promise<Result<void, Error>>

  // ChatMessage
  findChatMessagesBySessionId(sessionId: ChatSessionId): Promise<Result<ChatMessage[], Error>>
  saveChatMessage(message: ChatMessage): Promise<Result<void, Error>>
}
