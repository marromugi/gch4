import { eq, max, asc } from 'drizzle-orm'
import type { Database } from '@ding/database/client'
import { toolCallLog } from '@ding/database/schema'
import { Result } from '../../../domain/shared/Result/Result'
import { ToolCallLog } from '../../../domain/entity/ToolCallLog/ToolCallLog'
import { ToolCallLogId } from '../../../domain/valueObject/ToolCallLogId/ToolCallLogId'
import { ChatSessionId } from '../../../domain/valueObject/ChatSessionId/ChatSessionId'
import { AgentType } from '../../../domain/valueObject/AgentType/AgentType'
import type { IToolCallLogRepository } from '../../../domain/repository/IToolCallLogRepository/IToolCallLogRepository'

export class DrizzleToolCallLogRepository implements IToolCallLogRepository {
  constructor(private readonly db: Database) {}

  async create(entity: ToolCallLog): Promise<Result<void, Error>> {
    try {
      await this.db.insert(toolCallLog).values({
        id: entity.id.value,
        sessionId: entity.sessionId.value,
        sequence: entity.sequence,
        agent: entity.agent.value,
        toolName: entity.toolName,
        args: entity.args,
        result: entity.result,
        createdAt: entity.createdAt,
      })
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async createMany(toolCallLogs: ToolCallLog[]): Promise<Result<void, Error>> {
    if (toolCallLogs.length === 0) {
      return Result.ok(undefined)
    }

    try {
      await this.db.insert(toolCallLog).values(
        toolCallLogs.map((entity) => ({
          id: entity.id.value,
          sessionId: entity.sessionId.value,
          sequence: entity.sequence,
          agent: entity.agent.value,
          toolName: entity.toolName,
          args: entity.args,
          result: entity.result,
          createdAt: entity.createdAt,
        }))
      )
      return Result.ok(undefined)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async findBySessionId(sessionId: ChatSessionId): Promise<Result<ToolCallLog[], Error>> {
    try {
      const rows = await this.db
        .select()
        .from(toolCallLog)
        .where(eq(toolCallLog.sessionId, sessionId.value))
        .orderBy(asc(toolCallLog.sequence))
      return Result.ok(rows.map((row) => this.toEntity(row)))
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async getNextSequence(sessionId: ChatSessionId): Promise<Result<number, Error>> {
    try {
      const result = await this.db
        .select({ maxSequence: max(toolCallLog.sequence) })
        .from(toolCallLog)
        .where(eq(toolCallLog.sessionId, sessionId.value))

      const maxSequence = result[0]?.maxSequence ?? -1
      return Result.ok(maxSequence + 1)
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private toEntity(row: typeof toolCallLog.$inferSelect): ToolCallLog {
    return ToolCallLog.reconstruct({
      id: ToolCallLogId.fromString(row.id),
      sessionId: ChatSessionId.fromString(row.sessionId),
      sequence: row.sequence,
      agent: AgentType.from(row.agent),
      toolName: row.toolName,
      args: row.args,
      result: row.result,
      createdAt: row.createdAt,
    })
  }
}
