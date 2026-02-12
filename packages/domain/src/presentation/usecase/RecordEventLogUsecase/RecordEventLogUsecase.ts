import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'
import { EventLog } from '../../../domain/entity/EventLog/EventLog'
import { EventLogId } from '../../../domain/valueObject/EventLogId/EventLogId'
import { EventType } from '../../../domain/valueObject/EventType/EventType'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { JobId } from '../../../domain/valueObject/JobId/JobId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { ReviewPolicyVersionId } from '../../../domain/valueObject/ReviewPolicyVersionId/ReviewPolicyVersionId'

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
  applicationId?: string
  jobId?: string
  chatSessionId?: string
  policyVersionId?: string
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
      applicationId: input.applicationId ? ApplicationId.fromString(input.applicationId) : null,
      jobId: input.jobId ? JobId.fromString(input.jobId) : null,
      chatSessionId: input.chatSessionId ? ChatSessionId.fromString(input.chatSessionId) : null,
      policyVersionId: input.policyVersionId
        ? ReviewPolicyVersionId.fromString(input.policyVersionId)
        : null,
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
