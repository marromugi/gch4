import type { Result } from '../../shared/Result/Result'
import type { Submission } from '../../entity/Submission/Submission'
import type { SubmissionTask } from '../../entity/SubmissionTask/SubmissionTask'
import type { CollectedField } from '../../entity/CollectedField/CollectedField'
import type { ConsentLog } from '../../entity/ConsentLog/ConsentLog'
import type { ChatSession } from '../../entity/ChatSession/ChatSession'
import type { ChatMessage } from '../../entity/ChatMessage/ChatMessage'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import type { FormId } from '../../valueObject/FormId/FormId'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { SubmissionStatus } from '../../valueObject/SubmissionStatus/SubmissionStatus'
import type { CollectedFieldId } from '../../valueObject/CollectedFieldId/CollectedFieldId'

export interface ISubmissionRepository {
  findById(id: SubmissionId): Promise<Result<Submission, Error>>
  findByFormId(formId: FormId): Promise<Result<Submission[], Error>>
  findByFormIdAndStatus(
    formId: FormId,
    status: SubmissionStatus
  ): Promise<Result<Submission[], Error>>
  save(submission: Submission): Promise<Result<void, Error>>
  delete(id: SubmissionId): Promise<Result<void, Error>>

  // SubmissionTask
  findTasksBySubmissionId(submissionId: SubmissionId): Promise<Result<SubmissionTask[], Error>>
  saveTask(task: SubmissionTask): Promise<Result<void, Error>>
  saveTasks(tasks: SubmissionTask[]): Promise<Result<void, Error>>

  // CollectedField
  findCollectedFieldById(id: CollectedFieldId): Promise<Result<CollectedField, Error>>
  findCollectedFieldsBySubmissionId(
    submissionId: SubmissionId
  ): Promise<Result<CollectedField[], Error>>
  saveCollectedField(field: CollectedField): Promise<Result<void, Error>>
  saveCollectedFields(fields: CollectedField[]): Promise<Result<void, Error>>

  // ConsentLog
  findConsentLogsBySubmissionId(submissionId: SubmissionId): Promise<Result<ConsentLog[], Error>>
  saveConsentLog(log: ConsentLog): Promise<Result<void, Error>>

  // ChatSession
  findChatSessionsBySubmissionId(submissionId: SubmissionId): Promise<Result<ChatSession[], Error>>
  findChatSessionById(sessionId: ChatSessionId): Promise<Result<ChatSession, Error>>
  saveChatSession(session: ChatSession): Promise<Result<void, Error>>

  // ChatMessage
  findChatMessagesBySessionId(sessionId: ChatSessionId): Promise<Result<ChatMessage[], Error>>
  saveChatMessage(message: ChatMessage): Promise<Result<void, Error>>
}
