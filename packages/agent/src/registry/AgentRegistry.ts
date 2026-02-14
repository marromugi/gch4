import type { AgentDefinition, AgentFactoryDeps } from './types'
import type { AgentType } from '../agent/types'
import type { z } from 'zod'

/**
 * バリデーション結果の型
 */
export type ValidationResult = { success: true; data: unknown } | { success: false; error: Error }

/**
 * エージェントレジストリ
 *
 * 各エージェントの定義を一元管理する。
 * - argsSchema / resultSchema によるバリデーション
 * - サブタスク可能なエージェントの一覧取得
 */
export class AgentRegistry {
  private definitions: Map<AgentType, AgentDefinition> = new Map()

  /**
   * エージェント定義を登録
   */
  register<TArgs extends z.ZodType, TResult extends z.ZodType>(
    definition: AgentDefinition<TArgs, TResult>
  ): void {
    this.definitions.set(definition.type, definition as AgentDefinition)
  }

  /**
   * エージェント定義を取得
   */
  get(type: AgentType): AgentDefinition | undefined {
    return this.definitions.get(type)
  }

  /**
   * エージェント定義を取得（必須）
   * @throws エージェントが見つからない場合
   */
  getOrThrow(type: AgentType): AgentDefinition {
    const definition = this.definitions.get(type)
    if (!definition) {
      throw new Error(`Agent definition not found: ${type}`)
    }
    return definition
  }

  /**
   * 全エージェント定義を取得
   */
  getAll(): AgentDefinition[] {
    return Array.from(this.definitions.values())
  }

  /**
   * サブタスクとして呼び出し可能なエージェント一覧を取得
   */
  getSubtaskableAgents(): AgentType[] {
    return this.getAll()
      .filter((def) => def.isSubtaskable)
      .map((def) => def.type)
  }

  /**
   * args をバリデーション
   */
  validateArgs(type: AgentType, args: unknown): ValidationResult {
    const definition = this.get(type)
    if (!definition) {
      return {
        success: false,
        error: new Error(`Agent definition not found: ${type}`),
      }
    }
    const result = definition.argsSchema.safeParse(args)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return { success: false, error: new Error(String(result.error)) }
  }

  /**
   * result をバリデーション
   */
  validateResult(type: AgentType, result: unknown): ValidationResult {
    const definition = this.get(type)
    if (!definition) {
      return {
        success: false,
        error: new Error(`Agent definition not found: ${type}`),
      }
    }
    const parseResult = definition.resultSchema.safeParse(result)
    if (parseResult.success) {
      return { success: true, data: parseResult.data }
    }
    return { success: false, error: new Error(String(parseResult.error)) }
  }

  /**
   * エージェントインスタンスを作成
   */
  createAgent(type: AgentType, deps: AgentFactoryDeps) {
    const definition = this.getOrThrow(type)
    return definition.createAgent(deps)
  }

  /**
   * エージェントが登録されているか確認
   */
  has(type: AgentType): boolean {
    return this.definitions.has(type)
  }

  /**
   * 登録されているエージェント数
   */
  get size(): number {
    return this.definitions.size
  }
}
