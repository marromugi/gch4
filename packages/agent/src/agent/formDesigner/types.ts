import type { AgentTurnResult, BaseAgentContext } from '../types'
import type { GeneratedField, Question } from './tools'

/**
 * FormDesigner のセッション状態
 */
export interface FormDesignerState {
  /** セッションID */
  sessionId: string
  /** フォームの目的 */
  purpose: string
  /** セッションの状態 */
  status: 'asking' | 'generating' | 'completed'
  /** 収集した回答 */
  collectedAnswers: CollectedAnswer[]
  /** 生成されたフィールド（完了時） */
  generatedFields?: GeneratedField[]
}

/**
 * 収集した回答
 */
export interface CollectedAnswer {
  /** 質問ID */
  questionId: string
  /** 質問文 */
  question: string
  /** 選択されたオプションID */
  selectedOptionIds: string[]
  /** 選択されたオプションのラベル */
  selectedLabels: string[]
  /** 自由テキスト入力（オプション） */
  freeText?: string
}

/**
 * FormDesigner のコンテキスト
 */
export interface FormDesignerContext extends BaseAgentContext {
  type: 'form_designer'
  /** フォームの目的 */
  purpose: string
  /** FormDesigner 固有の状態 */
  formDesignerState: FormDesignerState
  /** 保留中の質問（回答待ち） */
  pendingQuestions?: Question[]
}

/**
 * FormDesigner のターン結果
 */
export interface FormDesignerTurnResult extends AgentTurnResult {
  /** 質問（ask_with_options が呼ばれた場合） */
  questions?: Question[]
  /** 生成されたフィールド（generate_fields が呼ばれた場合） */
  generatedFields?: GeneratedField[]
  /** 更新されたセッション状態 */
  sessionState: FormDesignerState
}

/**
 * ユーザーの回答入力
 */
export interface UserAnswerInput {
  /** 質問ID */
  questionId: string
  /** 選択されたオプションID */
  selectedOptionIds: string[]
  /** 自由テキスト入力（オプション） */
  freeText?: string
}

/**
 * API レスポンスの質問形式
 */
export interface QuestionResponse {
  id: string
  question: string
  options: { id: string; label: string }[]
  selectionType: 'radio' | 'checkbox'
}

/**
 * API レスポンスのフィールド形式
 */
export interface FieldResponse {
  fieldId: string
  label: string
  description: string | null
  intent: string | null
  required: boolean
  sortOrder: number
}
