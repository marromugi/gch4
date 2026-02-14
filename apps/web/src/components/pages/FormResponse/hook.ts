import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useGetSubmission,
  useMarkReviewCompleted,
  useMarkConsentChecked,
  useSubmitSubmission,
} from '@/lib/api/generated/submission/submission'
import {
  useCreateChatSession,
  useGetChatSession,
  useSendChatMessage,
  getChatSessionFormData,
} from '@/lib/api/generated/chat/chat'
import { useSaveConsentLog } from '@/lib/api/generated/consent-log/consent-log'
import { useGetFormFields } from '@/lib/api/generated/form/form'
import type { ResponseMode, Phase, ChatMessage, TodoItem } from './type'
import type { GetChatSessionFormData200DataCollectedFields } from '@/lib/api/generated/models'

export function useFormResponse(
  submissionId: string,
  mode: ResponseMode = 'live',
  formId?: string
) {
  const [phase, setPhase] = useState<Phase>('chat')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [formData, setFormData] = useState<Record<string, string> | null>(null)
  const sessionCreatedRef = useRef(false)

  // Submission 取得
  const {
    data: submissionData,
    isLoading: isLoadingSubmission,
    error: submissionError,
  } = useGetSubmission(submissionId)

  const submission = submissionData?.data

  // セッション作成
  const { mutateAsync: createSession } = useCreateChatSession()

  // セッション取得
  const { data: sessionData } = useGetChatSession(submissionId, sessionId ?? '', {
    query: {
      enabled: !!sessionId,
    },
  })

  // メッセージ送信
  const { mutateAsync: sendMessage } = useSendChatMessage()

  // 確認・同意・送信
  const { mutateAsync: markReviewed } = useMarkReviewCompleted()
  const { mutateAsync: markConsented } = useMarkConsentChecked()
  const { mutateAsync: submitSubmission } = useSubmitSubmission()
  const { mutateAsync: saveConsent } = useSaveConsentLog()

  // フォームフィールド取得（プレビューモード用）
  const { data: formFieldsData } = useGetFormFields(formId ?? '', {
    query: { enabled: mode === 'preview' && !!formId },
  })
  const formFieldLabels = useMemo(() => {
    if (!formFieldsData?.data) return {}
    return Object.fromEntries(formFieldsData.data.map((f) => [f.fieldId, f.label]))
  }, [formFieldsData])

  // 初期化: セッション作成
  useEffect(() => {
    if (!submission || sessionCreatedRef.current) return

    // 既に submit 済みの場合
    if (submission.submittedAt) {
      setPhase('complete')
      return
    }

    // 既に consent 済みの場合
    if (submission.consentCheckedAt) {
      setPhase('consent')
      return
    }

    // 既に review 済みの場合
    if (submission.reviewCompletedAt) {
      setPhase('review')
      return
    }

    sessionCreatedRef.current = true
    setIsInitializing(true)
    createSession({ submissionId })
      .then((res) => {
        const data = res.data
        setSessionId(data.session.id)
        setTodos(data.todos as TodoItem[])
        if (data.greeting) {
          setMessages([data.greeting as ChatMessage])
        }
      })
      .finally(() => {
        setIsInitializing(false)
      })
  }, [submission, submissionId, createSession])

  // セッションデータからメッセージ・Todosを復元
  useEffect(() => {
    if (!sessionData?.data) return
    if (sessionData.data.messages.length > 0) {
      setMessages(sessionData.data.messages as ChatMessage[])
    }
    if (sessionData.data.todos.length > 0) {
      setTodos(sessionData.data.todos as TodoItem[])
    }
  }, [sessionData])

  // isComplete 時に formData を取得
  useEffect(() => {
    if (isComplete && sessionId) {
      getChatSessionFormData(submissionId, sessionId)
        .then((res) => {
          const collectedFields = res.data
            .collectedFields as GetChatSessionFormData200DataCollectedFields
          const converted: Record<string, string> = {}
          for (const [key, value] of Object.entries(collectedFields)) {
            converted[key] = String(value)
          }
          setFormData(converted)
        })
        .catch((err) => {
          console.error('Failed to fetch form data:', err)
        })
    }
  }, [isComplete, sessionId, submissionId])

  // メッセージ送信
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isSending) return

      // ユーザーメッセージを即座に追加
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        chatSessionId: sessionId,
        role: 'user',
        content,
        targetFormFieldId: null,
        reviewPassed: null,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)

      try {
        const res = await sendMessage({
          submissionId,
          sessionId,
          data: { content },
        })

        const data = res.data
        // アシスタントメッセージを追加
        setMessages((prev) => [...prev, data.message as ChatMessage])
        setTodos(data.todos as TodoItem[])

        if (data.session.status === 'completed') {
          setIsComplete(true)
          if (mode !== 'preview') {
            setPhase('review')
          }
        }
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, isSending, submissionId, sendMessage, mode]
  )

  // 抽出結果確認完了
  const handleReviewComplete = useCallback(async () => {
    if (mode === 'preview') {
      setPhase('complete')
      return
    }
    await markReviewed({ submissionId })
    setPhase('consent')
  }, [submissionId, markReviewed, mode])

  // 同意完了 → 送信
  const handleConsentComplete = useCallback(async () => {
    // 同意ログ保存
    await saveConsent({
      data: {
        submissionId,
        consentType: 'data_usage',
        consented: true,
        ipAddress: '',
        userAgent: navigator.userAgent,
      },
    })
    await saveConsent({
      data: {
        submissionId,
        consentType: 'privacy_policy',
        consented: true,
        ipAddress: '',
        userAgent: navigator.userAgent,
      },
    })

    // 同意チェック記録
    await markConsented({ submissionId })

    // 送信
    await submitSubmission({ submissionId })

    setPhase('complete')
  }, [submissionId, saveConsent, markConsented, submitSubmission])

  return {
    phase,
    submission,
    messages,
    todos,
    isSending,
    isComplete,
    isLoading: isLoadingSubmission || isInitializing,
    error: submissionError,
    formData,
    formFieldLabels,
    sessionId,
    handleSendMessage,
    handleReviewComplete,
    handleConsentComplete,
  }
}
