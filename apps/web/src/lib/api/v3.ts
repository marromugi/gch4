import { API_BASE_URL } from './fetcher'

// ============================================================
// Types
// ============================================================

export type OrchestratorStage = 'BOOTSTRAP' | 'INTERVIEW_LOOP' | 'FINAL_AUDIT' | 'COMPLETED'

/**
 * ask_options ツールで使用する選択肢データ
 */
export interface AskOptionsData {
  options: Array<{ id: string; label: string }>
  selectionType: 'radio' | 'checkbox'
}

export interface V3SessionCreatedResponse {
  data: {
    sessionId: string
    greeting: string | null
    stage: OrchestratorStage
    askOptions?: AskOptionsData
  }
}

export interface V3MessageResponse {
  data: {
    response: string | null
    stage: OrchestratorStage
    isComplete: boolean
    collectedFields?: Record<string, string>
    askOptions?: AskOptionsData
  }
}

/**
 * LLMエラー時のフォールバックレスポンス
 */
export interface V3LlmErrorResponse {
  error: string
  errorType: 'LLM_ERROR'
  collectedFields: Record<string, string>
  remainingFieldIds: string[]
  currentStage: OrchestratorStage
}

/**
 * LLMエラーレスポンスかどうかを判定する型ガード
 */
export function isLlmErrorResponse(value: unknown): value is V3LlmErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'errorType' in value &&
    (value as V3LlmErrorResponse).errorType === 'LLM_ERROR'
  )
}

/**
 * LLMエラー情報を含むカスタムエラークラス
 */
export class V3LlmError extends Error {
  readonly errorType = 'LLM_ERROR' as const
  readonly collectedFields: Record<string, string>
  readonly remainingFieldIds: string[]
  readonly currentStage: OrchestratorStage

  constructor(response: V3LlmErrorResponse) {
    super(response.error)
    this.name = 'V3LlmError'
    this.collectedFields = response.collectedFields
    this.remainingFieldIds = response.remainingFieldIds
    this.currentStage = response.currentStage
  }
}

// ============================================================
// Utilities
// ============================================================

/**
 * ブラウザの言語設定を取得
 * @returns 言語コード（例: 'ja', 'en', 'zh', 'ko'）
 */
function getBrowserLanguage(): string {
  const lang = navigator.language || navigator.languages?.[0] || 'en'
  // 'ja-JP' → 'ja', 'en-US' → 'en' のように2文字に正規化
  return lang.split('-')[0].toLowerCase()
}

// ============================================================
// API Functions
// ============================================================

/**
 * V3 セッションを作成
 */
export async function createV3Session(formId: string): Promise<V3SessionCreatedResponse> {
  const browserLanguage = getBrowserLanguage()

  const response = await fetch(`${API_BASE_URL}/api/v3/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ formId, browserLanguage }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error((error as { error?: string }).error ?? `HTTP Error: ${response.status}`)
  }

  return response.json()
}

/**
 * V3 セッションにメッセージを送信
 *
 * LLMエラー時は V3LlmError をスローする（フォールバック用のデータを含む）
 */
export async function sendV3Message(
  sessionId: string,
  message: string
): Promise<V3MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v3/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    // LLMエラーの場合は V3LlmError をスロー
    if (isLlmErrorResponse(errorData)) {
      throw new V3LlmError(errorData)
    }

    throw new Error((errorData as { error?: string }).error ?? `HTTP Error: ${response.status}`)
  }

  return response.json()
}
