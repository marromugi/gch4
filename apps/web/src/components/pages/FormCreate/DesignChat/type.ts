/**
 * セッションの状態
 */
export type SessionStatus = 'asking' | 'generating' | 'completed'

/**
 * 選択タイプ
 */
export type SelectionType = 'radio' | 'checkbox'

/**
 * 質問のオプション
 */
export interface QuestionOption {
  id: string
  label: string
}

/**
 * 質問
 */
export interface Question {
  id: string
  question: string
  options: QuestionOption[]
  selectionType: SelectionType
}

/**
 * 完了条件
 */
export interface Criteria {
  criteriaKey: string
  criteria: string
  doneCondition: string
  questioningHints: string | null
}

/**
 * 生成されたフィールド
 */
export interface GeneratedField {
  fieldId: string
  label: string
  description: string | null
  intent: string | null
  required: boolean
  sortOrder: number
  criteria: Criteria[]
  boundaries: string[]
}

/**
 * セッションの状態
 */
export interface DesignSession {
  sessionId: string
  purpose: string
  status: SessionStatus
  questions?: Question[]
  fields?: GeneratedField[]
}

/**
 * ユーザーの回答
 */
export interface UserAnswer {
  questionId: string
  selectedOptionIds: string[]
  /** 自由テキスト入力（オプション） */
  freeText?: string
}

/**
 * DesignChat コンポーネントの Props
 */
export interface DesignChatProps {
  purpose: string
  onComplete: (fields: GeneratedField[]) => void
}

/**
 * QuestionCard コンポーネントの Props
 */
export interface QuestionCardProps {
  question: Question
  selectedOptionIds: string[]
  freeText: string
  onSelectionChange: (questionId: string, optionIds: string[]) => void
  onFreeTextChange: (questionId: string, text: string) => void
  disabled?: boolean
}

/**
 * OptionButton コンポーネントの Props
 */
export interface OptionButtonProps {
  option: QuestionOption
  isSelected: boolean
  selectionType: SelectionType
  onToggle: () => void
  disabled?: boolean
}
