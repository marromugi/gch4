// レジストリ本体
export { AgentRegistry } from './AgentRegistry'

// 型定義
export type { AgentDefinition, AgentState, AgentFactoryDeps } from './types'

// 各エージェントの definition
export { greeterDefinition } from '../agent/greeter/definition'
export { architectDefinition } from '../agent/architect/definition'
export { interviewerDefinition } from '../agent/interviewer/definition'
export { quickCheckDefinition } from '../agent/quickCheck/definition'
export { reviewerDefinition } from '../agent/reviewer/definition'
export { auditorDefinition } from '../agent/auditor/definition'

// args/result スキーマのエクスポート
export {
  greeterArgsSchema,
  greeterResultSchema,
  type GreeterArgs,
  type GreeterResult,
} from '../agent/greeter/definition'

export {
  architectArgsSchema,
  architectResultSchema,
  type ArchitectArgs,
  type ArchitectResult,
} from '../agent/architect/definition'

export {
  interviewerArgsSchema,
  interviewerResultSchema,
  type InterviewerArgs,
  type InterviewerResult,
} from '../agent/interviewer/definition'

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

import { architectDefinition } from '../agent/architect/definition'
import { auditorDefinition } from '../agent/auditor/definition'
import { greeterDefinition } from '../agent/greeter/definition'
import { interviewerDefinition } from '../agent/interviewer/definition'
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

  registry.register(greeterDefinition)
  registry.register(architectDefinition)
  registry.register(interviewerDefinition)
  registry.register(quickCheckDefinition)
  registry.register(reviewerDefinition)
  registry.register(auditorDefinition)

  return registry
}
