import type { State } from '../../orchestrator/types'
import type { BaseAgentContext, AgentTurnResult } from '../types'

/**
 * Greeter のセクション
 * State から導出される
 */
export type GreeterSection = 'language' | 'country' | 'timezone' | 'completed'

/**
 * State から現在のセクションを導出
 */
export function getSection(state: State): GreeterSection {
  if (!state.language) return 'language'
  if (!state.country) return 'country'
  if (!state.timezone) return 'timezone'
  return 'completed'
}

/**
 * Greeter エージェントのコンテキスト
 */
export interface GreeterContext extends BaseAgentContext {
  type: 'greeter'
  /** 現在のワークフロー状態（Orchestrator から渡される） */
  state: State
}

/**
 * Greeter エージェントの結果
 */
export interface GreeterTurnResult extends AgentTurnResult {
  /** 現在のセクション */
  section: GreeterSection
}
