import type { Result } from '../../shared/Result/Result'
import type { ToolCallLog } from '../../entity/ToolCallLog/ToolCallLog'
import type { ChatSessionId } from '../../valueObject/ChatSessionId/ChatSessionId'

export interface IToolCallLogRepository {
  /**
   * ツール呼び出しログを作成
   */
  create(toolCallLog: ToolCallLog): Promise<Result<void, Error>>

  /**
   * 複数のツール呼び出しログを一括作成
   */
  createMany(toolCallLogs: ToolCallLog[]): Promise<Result<void, Error>>

  /**
   * セッションIDでツール呼び出しログを取得（sequence順）
   */
  findBySessionId(sessionId: ChatSessionId): Promise<Result<ToolCallLog[], Error>>

  /**
   * セッションの次のシーケンス番号を取得
   */
  getNextSequence(sessionId: ChatSessionId): Promise<Result<number, Error>>
}
