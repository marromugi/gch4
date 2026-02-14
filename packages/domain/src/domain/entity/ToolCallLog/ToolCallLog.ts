import type { Entity } from '../../shared/Entity/Entity'
import type { ToolCallLogId } from '../../valueObject/ToolCallLogId/ToolCallLogId'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'
import type { AgentType } from '../../valueObject/AgentType/AgentType'

export interface ToolCallLogProps {
  id: ToolCallLogId
  sessionId: ChatSessionId
  /** ログの順序（セッション内で一意） */
  sequence: number
  /** 実行したエージェント */
  agent: AgentType
  /** ツール名 */
  toolName: string
  /** ツールの引数（JSON文字列） */
  args: string
  /** ツールの結果（JSON文字列、null可） */
  result: string | null
  createdAt: Date
}

/**
 * ツール呼び出しログエンティティ（追記のみ、Event Sourcing用）
 *
 * サブセッションの状態復元に使用する。
 * 全てのツール呼び出しを記録し、ログを再生することで状態を導出する。
 */
export class ToolCallLog implements Entity<ToolCallLogId> {
  private constructor(private readonly props: ToolCallLogProps) {}

  get id(): ToolCallLogId {
    return this.props.id
  }

  get sessionId(): ChatSessionId {
    return this.props.sessionId
  }

  get sequence(): number {
    return this.props.sequence
  }

  get agent(): AgentType {
    return this.props.agent
  }

  get toolName(): string {
    return this.props.toolName
  }

  get args(): string {
    return this.props.args
  }

  get result(): string | null {
    return this.props.result
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  /**
   * 引数をパースして返す
   */
  getArgsAsObject<T = Record<string, unknown>>(): T {
    return JSON.parse(this.props.args) as T
  }

  /**
   * 結果をパースして返す（null の場合は undefined）
   */
  getResultAsObject<T = unknown>(): T | undefined {
    if (this.props.result === null) {
      return undefined
    }
    return JSON.parse(this.props.result) as T
  }

  static create(props: ToolCallLogProps): ToolCallLog {
    if (!props.toolName || props.toolName.trim().length === 0) {
      throw new Error('ToolCallLog toolName cannot be empty')
    }
    if (props.sequence < 0) {
      throw new Error('ToolCallLog sequence must be non-negative')
    }
    // args は空でも許容（引数なしのツールもある）
    return new ToolCallLog(props)
  }

  static reconstruct(props: ToolCallLogProps): ToolCallLog {
    return new ToolCallLog(props)
  }

  equals(other: ToolCallLog): boolean {
    return this.props.id.equals(other.props.id)
  }
}
