import type { Result } from '../../../domain/shared/Result/Result'
import { Result as R } from '../../../domain/shared/Result/Result'
import type { IApplicationRepository } from '../../../domain/repository/IApplicationRepository/IApplicationRepository'
import type { IEventLogRepository } from '../../../domain/repository/IEventLogRepository/IEventLogRepository'
import type { Application } from '../../../domain/entity/Application/Application'
import { FallbackService } from '../../../domain/service/FallbackService/FallbackService'
import { EventLog } from '../../../domain/entity/EventLog/EventLog'
import { ApplicationId } from '../../../domain/valueObject/ApplicationId/ApplicationId'
import { EventLogId } from '../../../domain/valueObject/EventLogId/EventLogId'
import { EventType } from '../../../domain/valueObject/EventType/EventType'

// --- Error ---
export class TriggerManualFallbackNotFoundError extends Error {
  readonly type = 'not_found' as const
  constructor(applicationId: string) {
    super(`Application not found: ${applicationId}`)
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
  applicationId: string
  eventLogId: string
}

export interface TriggerManualFallbackDeps {
  applicationRepository: IApplicationRepository
  eventLogRepository: IEventLogRepository
  fallbackService: FallbackService
}

export type TriggerManualFallbackOutput = Application

// --- Usecase ---
export class TriggerManualFallbackUsecase {
  constructor(private readonly deps: TriggerManualFallbackDeps) {}

  async execute(
    input: TriggerManualFallbackInput
  ): Promise<Result<TriggerManualFallbackOutput, TriggerManualFallbackError>> {
    const applicationId = ApplicationId.fromString(input.applicationId)

    // Application の存在確認
    const appResult = await this.deps.applicationRepository.findById(applicationId)
    if (!appResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(appResult.error.message))
    }

    const application = appResult.value

    // 未完了Todoを取得
    const todosResult =
      await this.deps.applicationRepository.findTodosByApplicationId(applicationId)
    if (!todosResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(todosResult.error.message))
    }

    // FallbackService で未完了Todoを manual_input に遷移
    const updatedTodos = this.deps.fallbackService.triggerFallback(todosResult.value)

    // Todoを保存
    const saveTodosResult = await this.deps.applicationRepository.saveTodos(updatedTodos)
    if (!saveTodosResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(saveTodosResult.error.message))
    }

    // manual_fallback_triggered イベントを記録
    const eventLog = EventLog.create({
      id: EventLogId.fromString(input.eventLogId),
      eventType: EventType.manualFallbackTriggered(),
      applicationId,
      jobId: null,
      chatSessionId: null,
      policyVersionId: null,
      metadata: null,
      createdAt: new Date(),
    })

    const eventResult = await this.deps.eventLogRepository.create(eventLog)
    if (!eventResult.success) {
      return R.err(new TriggerManualFallbackRepositoryError(eventResult.error.message))
    }

    return R.ok(application)
  }
}
