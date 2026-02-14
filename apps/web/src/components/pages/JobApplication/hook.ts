import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useGetApplication,
  useMarkExtractionReviewed,
  useMarkConsentChecked,
  useSubmitApplication,
} from '@/lib/api/generated/application/application'
import {
  useCreateChatSession,
  useGetChatSession,
  useSendChatMessage,
  getChatSessionFormData,
} from '@/lib/api/generated/chat/chat'
import { useSaveConsentLog } from '@/lib/api/generated/consent-log/consent-log'
import { useGetJobFormFields } from '@/lib/api/generated/job/job'
import type { ApplicationMode, Phase, ChatMessage, TodoItem } from './type'

export function useJobApplication(
  applicationId: string,
  mode: ApplicationMode = 'live',
  jobId?: string
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

  // Application 取得
  const {
    data: applicationData,
    isLoading: isLoadingApplication,
    error: applicationError,
  } = useGetApplication(applicationId)

  const application = applicationData?.data

  // セッション作成
  const { mutateAsync: createSession } = useCreateChatSession()

  // セッション取得
  const { data: sessionData } = useGetChatSession(applicationId, sessionId ?? '', {
    query: {
      enabled: !!sessionId,
    },
  })

  // メッセージ送信
  const { mutateAsync: sendMessage } = useSendChatMessage()

  // 確認・同意・送信
  const { mutateAsync: markReviewed } = useMarkExtractionReviewed()
  const { mutateAsync: markConsented } = useMarkConsentChecked()
  const { mutateAsync: submitApp } = useSubmitApplication()
  const { mutateAsync: saveConsent } = useSaveConsentLog()

  // フォームフィールド取得（プレビューモード用）
  const { data: formFieldsData } = useGetJobFormFields(jobId ?? '', {
    query: { enabled: mode === 'preview' && !!jobId },
  })
  const formFieldLabels = useMemo(() => {
    if (!formFieldsData?.data) return {}
    return Object.fromEntries(formFieldsData.data.map((f) => [f.fieldId, f.label]))
  }, [formFieldsData])

  // 初期化: セッション作成
  useEffect(() => {
    if (!application || sessionCreatedRef.current) return

    // 既に submit 済みの場合
    if (application.submittedAt) {
      setPhase('complete')
      return
    }

    // 既に consent 済みの場合
    if (application.consentCheckedAt) {
      setPhase('consent')
      return
    }

    // 既に extraction reviewed 済みの場合
    if (application.extractionReviewedAt) {
      setPhase('review')
      return
    }

    sessionCreatedRef.current = true
    setIsInitializing(true)
    createSession({ applicationId })
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
  }, [application, applicationId, createSession])

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
      getChatSessionFormData(applicationId, sessionId)
        .then((res) => {
          setFormData(res.data.collectedFields)
        })
        .catch((err) => {
          console.error('Failed to fetch form data:', err)
        })
    }
  }, [isComplete, sessionId, applicationId])

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
        targetJobFormFieldId: null,
        reviewPassed: null,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)

      try {
        const res = await sendMessage({
          applicationId,
          sessionId,
          data: { message: content },
        })

        const data = res.data
        // アシスタントメッセージを追加（ユーザーメッセージはIDを維持してアニメーション再生を防ぐ）
        setMessages((prev) => [...prev, data.message as ChatMessage])
        setTodos(data.todos as TodoItem[])

        if (data.isComplete) {
          setIsComplete(true)
          if (mode !== 'preview') {
            setPhase('review')
          }
        }
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, isSending, applicationId, sendMessage]
  )

  // 抽出結果確認完了
  const handleReviewComplete = useCallback(async () => {
    if (mode === 'preview') {
      setPhase('complete')
      return
    }
    await markReviewed({ applicationId })
    setPhase('consent')
  }, [applicationId, markReviewed, mode])

  // 同意完了 → 応募送信
  const handleConsentComplete = useCallback(async () => {
    // 同意ログ保存
    await saveConsent({
      data: {
        applicationId,
        consentType: 'data_usage',
        consented: true,
        ipAddress: '',
        userAgent: navigator.userAgent,
      },
    })
    await saveConsent({
      data: {
        applicationId,
        consentType: 'privacy_policy',
        consented: true,
        ipAddress: '',
        userAgent: navigator.userAgent,
      },
    })

    // 同意チェック記録
    await markConsented({ applicationId })

    // 応募送信
    await submitApp({ applicationId })

    setPhase('complete')
  }, [applicationId, saveConsent, markConsented, submitApp])

  return {
    phase,
    application,
    messages,
    todos,
    isSending,
    isComplete,
    isLoading: isLoadingApplication || isInitializing,
    error: applicationError,
    formData,
    formFieldLabels,
    sessionId,
    handleSendMessage,
    handleReviewComplete,
    handleConsentComplete,
  }
}
