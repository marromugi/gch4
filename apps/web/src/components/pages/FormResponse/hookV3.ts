import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGetFormFields } from '@/lib/api/generated/form/form'
import {
  createV3Session,
  sendV3Message,
  V3LlmError,
  type OrchestratorStage,
  type AskOptionsData,
} from '@/lib/api/v3'

export interface V3ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface UseFormResponseV3Result {
  messages: V3ChatMessage[]
  isSending: boolean
  isComplete: boolean
  isLoading: boolean
  error: Error | null
  formData: Record<string, string> | null
  formFieldLabels: Record<string, string>
  sessionId: string | null
  currentStage: OrchestratorStage | null
  currentAskOptions: AskOptionsData | null
  handleSendMessage: (content: string) => Promise<void>
  handleOptionSubmit: (selectedIds: string[], freeText?: string) => Promise<void>
  /** フォールバックモードフラグ */
  isFallbackMode: boolean
  /** フォールバック時の収集済みフィールド */
  fallbackCollectedFields: Record<string, string>
  /** フォールバック時の未収集フィールドID */
  fallbackRemainingFieldIds: string[]
  /** フォールバックフォーム送信ハンドラ */
  handleFallbackSubmit: (values: Record<string, string>) => void
}

/**
 * V3 API を使用したフォームレスポンス用フック
 *
 * Submission を作成せず、formId のみで V3 セッションを開始する
 */
export function useFormResponseV3(formId: string): UseFormResponseV3Result {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<V3ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [formData, setFormData] = useState<Record<string, string> | null>(null)
  const [currentStage, setCurrentStage] = useState<OrchestratorStage | null>(null)
  const [currentAskOptions, setCurrentAskOptions] = useState<AskOptionsData | null>(null)
  const sessionCreatedRef = useRef(false)

  // フォールバック状態
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const [fallbackCollectedFields, setFallbackCollectedFields] = useState<Record<string, string>>({})
  const [fallbackRemainingFieldIds, setFallbackRemainingFieldIds] = useState<string[]>([])

  // フォームフィールド取得（ラベル表示用）
  const { data: formFieldsData } = useGetFormFields(formId, {
    query: { enabled: !!formId },
  })
  const formFieldLabels = useMemo(() => {
    if (!formFieldsData?.data) return {}
    return Object.fromEntries(formFieldsData.data.map((f) => [f.fieldId, f.label]))
  }, [formFieldsData])

  // 初期化: V3 セッション作成
  useEffect(() => {
    if (!formId || sessionCreatedRef.current) return
    sessionCreatedRef.current = true

    setIsLoading(true)
    createV3Session(formId)
      .then((res) => {
        const data = res.data
        setSessionId(data.sessionId)
        setCurrentStage(data.stage)

        // 挨拶メッセージがあれば追加
        if (data.greeting) {
          const greetingMessage: V3ChatMessage = {
            id: `greeting-${Date.now()}`,
            role: 'assistant',
            content: data.greeting,
            createdAt: new Date().toISOString(),
          }
          setMessages([greetingMessage])
        }

        // 選択肢があれば設定
        if (data.askOptions) {
          setCurrentAskOptions(data.askOptions)
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Session creation failed'))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [formId])

  // メッセージ送信
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isSending) return

      // ユーザーメッセージを即座に追加
      const userMessage: V3ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)

      try {
        const res = await sendV3Message(sessionId, content)
        const data = res.data

        // ステージを更新
        setCurrentStage(data.stage)

        // アシスタントメッセージを追加
        if (data.response) {
          const assistantMessage: V3ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response,
            createdAt: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMessage])
        }

        // 選択肢を更新
        if (data.askOptions) {
          setCurrentAskOptions(data.askOptions)
        } else {
          setCurrentAskOptions(null)
        }

        // 完了チェック
        if (data.isComplete) {
          setIsComplete(true)
          setCurrentAskOptions(null)
          if (data.collectedFields) {
            setFormData(data.collectedFields)
          }
        }
      } catch (err) {
        // LLMエラーの場合はフォールバックモードに切り替え
        if (err instanceof V3LlmError) {
          setIsFallbackMode(true)
          setFallbackCollectedFields(err.collectedFields)
          setFallbackRemainingFieldIds(err.remainingFieldIds)
          setCurrentStage(err.currentStage)
          // エラーメッセージをアシスタントメッセージとして追加
          const errorMessage: V3ChatMessage = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'エラーが発生しました。下のフォームから入力してください。',
            createdAt: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } else {
          setError(err instanceof Error ? err : new Error('Message send failed'))
        }
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, isSending]
  )

  // フォールバックフォーム送信ハンドラ
  const handleFallbackSubmit = useCallback(
    (values: Record<string, string>) => {
      // 収集済みフィールドとフォームから入力された値をマージ
      const allFields = { ...fallbackCollectedFields, ...values }
      setFormData(allFields)
      setIsComplete(true)
      setIsFallbackMode(false)
    },
    [fallbackCollectedFields]
  )

  // 選択肢の送信ハンドラ
  const handleOptionSubmit = useCallback(
    async (selectedIds: string[], freeText?: string) => {
      if (!currentAskOptions) return

      // 選択された内容を文字列に変換
      const selectedLabels = currentAskOptions.options
        .filter((o) => selectedIds.includes(o.id))
        .map((o) => o.label)
        .join(', ')

      // メッセージを構築
      let content = selectedLabels
      if (freeText && freeText.trim()) {
        content = content ? `${content}\n補足: ${freeText}` : freeText
      }

      // 選択肢をクリアしてからメッセージを送信
      setCurrentAskOptions(null)
      await handleSendMessage(content || '')
    },
    [currentAskOptions, handleSendMessage]
  )

  return {
    messages,
    isSending,
    isComplete,
    isLoading,
    error,
    formData,
    formFieldLabels,
    sessionId,
    currentStage,
    currentAskOptions,
    handleSendMessage,
    handleOptionSubmit,
    isFallbackMode,
    fallbackCollectedFields,
    fallbackRemainingFieldIds,
    handleFallbackSubmit,
  }
}
