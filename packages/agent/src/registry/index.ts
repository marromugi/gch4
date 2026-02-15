// レジストリ本体
export { AgentRegistry } from './AgentRegistry'

// 型定義
export type { AgentDefinition, AgentState, AgentFactoryDeps } from './types'

// 各エージェントの definition
export { quickCheckDefinition } from '../agent/quickCheck/definition'
export { reviewerDefinition } from '../agent/reviewer/definition'
export { auditorDefinition } from '../agent/auditor/definition'

// args/result スキーマのエクスポート
export {
  quickCheckArgsSchema,
  quickCheckResultSchema,
  type QuickCheckArgs,
  type QuickCheckResult,
} from '../agent/quickCheck/definition'

export {
  reviewerArgsSchema,
  reviewerResultSchema,
  type ReviewerArgs,
  type ReviewerResult,
} from '../agent/reviewer/definition'

export {
  auditorArgsSchema,
  auditorResultSchema,
  type AuditorArgs,
  type AuditorResult,
} from '../agent/auditor/definition'

import { auditorDefinition } from '../agent/auditor/definition'
import { quickCheckDefinition } from '../agent/quickCheck/definition'
import { reviewerDefinition } from '../agent/reviewer/definition'
import { AgentRegistry } from './AgentRegistry'

/**
 * デフォルトのエージェントレジストリを作成
 *
 * すべてのエージェント定義を登録したレジストリを返す。
 */
export function createDefaultRegistry(): AgentRegistry {
  const registry = new AgentRegistry()

  registry.register(quickCheckDefinition)
  registry.register(reviewerDefinition)
  registry.register(auditorDefinition)

  return registry
}
