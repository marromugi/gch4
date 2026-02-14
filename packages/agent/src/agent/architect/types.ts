import type { State } from '../../orchestrator/types'
import type { BaseAgentContext, AgentTurnResult } from '../types'
import type { Plan } from './schemas'

/**
 * Architect に渡されるフィールド情報
 */
export interface JobFormFieldInput {
  /** フィールドID */
  id: string
  /** フィールド識別子 */
  fieldId: string
  /** 表示名 */
  label: string
  /** 深掘り観点 */
  intent: string | null
  /** 必須フラグ */
  required: boolean
  /** 表示順序 */
  sortOrder: number
}

/**
 * Architect に渡されるFieldFact定義
 */
export interface FieldFactDefinitionInput {
  /** ID */
  id: string
  /** 紐づくJobFormFieldのID */
  jobFormFieldId: string
  /** Factのキー */
  factKey: string
  /** 収集すべき事実 */
  fact: string
  /** 完了条件 */
  doneCriteria: string
  /** 質問時のヒント */
  questioningHints: string | null
}

/**
 * Architect エージェントのコンテキスト
 */
export interface ArchitectContext extends BaseAgentContext {
  type: 'architect'
  /** 現在のワークフロー状態 */
  state: State
  /** 求人のフォームフィールド */
  jobFormFields: JobFormFieldInput[]
  /** フィールドFact定義 */
  fieldFactDefinitions: FieldFactDefinitionInput[]
}

/**
 * Architect エージェントの結果
 */
export interface ArchitectTurnResult extends AgentTurnResult {
  /** 作成されたプラン */
  plan?: Plan
}
