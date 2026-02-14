import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'
import { EventLog } from '../../../domain/entity/EventLog/EventLog'
import { EventLogId } from '../../../domain/valueObject/EventLogId/EventLogId'
import { EventType } from '../../../domain/valueObject/EventType/EventType'
import { SubmissionId } from '../../../domain/valueObject/SubmissionId/SubmissionId'
import { FormId } from '../../../domain/valueObject/FormId/FormId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'

// --- Error ---
export class RecordEventLogValidationError extends Error {
  readonly type = 'validation_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'RecordEventLogValidationError'
  }
}

export class RecordEventLogRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'RecordEventLogRepositoryError'
  }
}

export type RecordEventLogError = RecordEventLogValidationError | RecordEventLogRepositoryError

// --- Input / Output / Deps ---
export interface RecordEventLogInput {
  eventLogId: string
  eventType: string
  submissionId?: string
  formId?: string
  chatSessionId?: string
  metadata?: string
}

export interface RecordEventLogDeps {
  eventLogRepository: IEventLogRepository
}

export type RecordEventLogOutput = EventLog

// --- Usecase ---
export class RecordEventLogUsecase {
  constructor(private readonly deps: RecordEventLogDeps) {}

  async execute(
    input: RecordEventLogInput
  ): Promise<Result<RecordEventLogOutput, RecordEventLogError>> {
    // バリデーション
    let eventType: EventType
    try {
      eventType = EventType.from(input.eventType)
    } catch {
      return R.err(new RecordEventLogValidationError(`Invalid eventType: ${input.eventType}`))
    }

    // EventLog を作成
    const eventLog = EventLog.create({
      id: EventLogId.fromString(input.eventLogId),
      eventType,
      submissionId: input.submissionId ? SubmissionId.fromString(input.submissionId) : null,
      formId: input.formId ? FormId.fromString(input.formId) : null,
      chatSessionId: input.chatSessionId ? ChatSessionId.fromString(input.chatSessionId) : null,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    })

    // 保存
    const saveResult = await this.deps.eventLogRepository.create(eventLog)
    if (!saveResult.success) {
      return R.err(new RecordEventLogRepositoryError(saveResult.error.message))
    }

    return R.ok(eventLog)
  }
}
