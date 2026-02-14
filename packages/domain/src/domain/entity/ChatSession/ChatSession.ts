import type { TimestampedEntity } from '../../shared/Entity/Entity'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { SubmissionId } from '../../valueObject/SubmissionId/SubmissionId'
import type { FormId } from '../../valueObject/FormId/FormId'
import type { UserId } from '../../valueObject/UserId/UserId'
import type { ChatSessionType } from '../../valueObject/ChatSessionType/ChatSessionType'
import { ChatSessionStatus } from '../../valueObject/ChatSessionStatus/ChatSessionStatus'
import type { AgentType } from '../../valueObject/AgentType/AgentType'

export interface ChatSessionProps {
  id: ChatSessionId
  submissionId: SubmissionId | null
  formId: FormId | null
  type: ChatSessionType
  conductorId: UserId | null
  bootstrapCompleted: boolean
  status: ChatSessionStatus
  turnCount: number
  softCap: number | null
  hardCap: number | null
  softCappedAt: Date | null
  hardCappedAt: Date | null
  reviewFailStreak: number
  extractionFailStreak: number
  timeoutStreak: number
  currentAgent: AgentType
  /** 情報収集プラン（JSON文字列） */
  plan: string | null
  /** プランスキーマバージョン */
  planSchemaVersion: number | null
  createdAt: Date
  updatedAt: Date
}

/**
 * チャットセッションエンティティ
 */
export class ChatSession implements TimestampedEntity<ChatSessionId> {
  private constructor(private readonly props: ChatSessionProps) {}

  get id(): ChatSessionId {
    return this.props.id
  }

  get submissionId(): SubmissionId | null {
    return this.props.submissionId
  }

  get formId(): FormId | null {
    return this.props.formId
  }

  get type(): ChatSessionType {
    return this.props.type
  }

  get conductorId(): UserId | null {
    return this.props.conductorId
  }

  get bootstrapCompleted(): boolean {
    return this.props.bootstrapCompleted
  }

  get status(): ChatSessionStatus {
    return this.props.status
  }

  get turnCount(): number {
    return this.props.turnCount
  }

  get softCap(): number | null {
    return this.props.softCap
  }

  get hardCap(): number | null {
    return this.props.hardCap
  }

  get softCappedAt(): Date | null {
    return this.props.softCappedAt
  }

  get hardCappedAt(): Date | null {
    return this.props.hardCappedAt
  }

  get reviewFailStreak(): number {
    return this.props.reviewFailStreak
  }

  get extractionFailStreak(): number {
    return this.props.extractionFailStreak
  }

  get timeoutStreak(): number {
    return this.props.timeoutStreak
  }

  get currentAgent(): AgentType {
    return this.props.currentAgent
  }

  /** 情報収集プラン（JSON文字列） */
  get plan(): string | null {
    return this.props.plan
  }

  /** プランスキーマバージョン */
  get planSchemaVersion(): number | null {
    return this.props.planSchemaVersion
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  static create(props: ChatSessionProps): ChatSession {
    return new ChatSession(props)
  }

  static reconstruct(props: ChatSessionProps): ChatSession {
    return new ChatSession(props)
  }

  completeBootstrap(): ChatSession {
    return new ChatSession({
      ...this.props,
      bootstrapCompleted: true,
      updatedAt: new Date(),
    })
  }

  incrementTurnCount(): ChatSession {
    return new ChatSession({
      ...this.props,
      turnCount: this.props.turnCount + 1,
      updatedAt: new Date(),
    })
  }

  incrementReviewFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      reviewFailStreak: this.props.reviewFailStreak + 1,
      updatedAt: new Date(),
    })
  }

  incrementExtractionFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      extractionFailStreak: this.props.extractionFailStreak + 1,
      updatedAt: new Date(),
    })
  }

  incrementTimeoutStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      timeoutStreak: this.props.timeoutStreak + 1,
      updatedAt: new Date(),
    })
  }

  resetReviewFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      reviewFailStreak: 0,
      updatedAt: new Date(),
    })
  }

  resetExtractionFailStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      extractionFailStreak: 0,
      updatedAt: new Date(),
    })
  }

  resetTimeoutStreak(): ChatSession {
    return new ChatSession({
      ...this.props,
      timeoutStreak: 0,
      updatedAt: new Date(),
    })
  }

  /**
   * 現在のエージェントを変更
   */
  changeAgent(newAgent: AgentType): ChatSession {
    return new ChatSession({
      ...this.props,
      currentAgent: newAgent,
      updatedAt: new Date(),
    })
  }

  /**
   * 情報収集プランを設定
   * @param plan プランオブジェクト（JSON.stringifyされる）
   * @param schemaVersion スキーマバージョン（デフォルト: 1）
   */
  setPlan(plan: unknown, schemaVersion: number = 1): ChatSession {
    return new ChatSession({
      ...this.props,
      plan: JSON.stringify(plan),
      planSchemaVersion: schemaVersion,
      updatedAt: new Date(),
    })
  }

  /**
   * 情報収集プランを取得（パース済み）
   * @returns パース成功時はオブジェクト、失敗時は null
   */
  getPlan<T = unknown>(): T | null {
    if (!this.props.plan) return null

    try {
      return JSON.parse(this.props.plan) as T
    } catch {
      return null
    }
  }

  /**
   * フォールバック条件に達しているか
   */
  shouldFallback(): boolean {
    return (
      this.props.reviewFailStreak >= 3 ||
      this.props.extractionFailStreak >= 2 ||
      this.props.timeoutStreak >= 2
    )
  }

  complete(): ChatSession {
    if (!this.props.status.canTransitionTo(ChatSessionStatus.completed())) {
      throw new Error(`Cannot complete session in status: ${this.props.status.value}`)
    }
    return new ChatSession({
      ...this.props,
      status: ChatSessionStatus.completed(),
      updatedAt: new Date(),
    })
  }

  equals(other: ChatSession): boolean {
    return this.props.id.equals(other.props.id)
  }
}
