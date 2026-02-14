import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { ISubmissionRepository } from '../../../domain/repository/ISubmissionRepository/ISubmissionRepository'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'
import type { Submission } from '../../../domain/entity/Submission/Submission'
import { FallbackService } from '../../../domain/service/FallbackService/FallbackService'
import { EventLog } from '../../../domain/entity/EventLog/EventLog'
import { SubmissionId } from '../../../domain/valueObject/SubmissionId/SubmissionId'
import { EventLogId } from '../../../domain/valueObject/EventLogId/EventLogId'
import { EventType } from '../../../domain/valueObject/EventType/EventType'

// --- Error ---
export class TriggerManualFallbackNotFoundError extends Error {
  readonly type = 'not_found' as const
  constructor(submissionId: string) {
    super(`Submission not found: ${submissionId}`)
    this.name = 'TriggerManualFallbackNotFoundError'
  }
}

export class TriggerManualFallbackRepositoryError extends Error {
  readonly type = 'repository_error' as const
  constructor(message: string) {
    super(message)
    this.name = 'TriggerManualFallbackRepositoryError'
  }
}

export type TriggerManualFallbackError =
  | TriggerManualFallbackNotFoundError
  | TriggerManualFallbackRepositoryError

// --- Input / Output / Deps ---
export interface TriggerManualFallbackInput {
  submissionId: string
  eventLogId: string
}

export interface TriggerManualFallbackDeps {
  submissionRepository: ISubmissionRepository
  eventLogRepository: IEventLogRepository
  fallbackService: FallbackService
}

export type TriggerManualFallbackOutput = Submission

// --- Usecase ---
export class TriggerManualFallbackUsecase {
  constructor(private readonly deps: TriggerManualFallbackDeps) {}

  async execute(
    input: TriggerManualFallbackInput
  ): Promise<Result<TriggerManualFallbackOutput, TriggerManualFallbackError>> {
    const submissionId = SubmissionId.fromString(input.submissionId)

    // Submission の存在確認
    const submissionResult = await this.deps.submissionRepository.findById(submissionId)
    if (!submissionResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(submissionResult.error.message))
    }

    const submission = submissionResult.value

    // 未完了Taskを取得
    const tasksResult = await this.deps.submissionRepository.findTasksBySubmissionId(submissionId)
    if (!tasksResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(tasksResult.error.message))
    }

    // FallbackService で未完了Taskを manual_input に遷移
    const updatedTasks = this.deps.fallbackService.triggerFallback(tasksResult.value)

    // Taskを保存
    const saveTasksResult = await this.deps.submissionRepository.saveTasks(updatedTasks)
    if (!saveTasksResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(saveTasksResult.error.message))
    }

    // manual_fallback_triggered イベントを記録
    const eventLog = EventLog.create({
      id: EventLogId.fromString(input.eventLogId),
      eventType: EventType.manualFallbackTriggered(),
      submissionId,
      formId: null,
      chatSessionId: null,
      metadata: null,
      createdAt: new Date(),
    })

    const eventResult = await this.deps.eventLogRepository.create(eventLog)
    if (!eventResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(eventResult.error.message))
    }

    return R.ok(submission)
  }
}
