import { useCallback, useState } from 'react'
import { API_BASE_URL } from '../../../../lib/api/fetcher'
import type { DesignSession, GeneratedField, Question, UserAnswer } from './type'

interface UseDesignSessionOptions {
  purpose: string
  onComplete?: (fields: GeneratedField[]) => void
}

/**
 * 回答の状態（選択肢と自由テキスト）
 */
interface AnswerState {
  selectedOptionIds: string[]
  freeText: string
}

interface UseDesignSessionReturn {
  session: DesignSession | null
  questions: Question[]
  answers: Map<string, AnswerState>
  isLoading: boolean
  error: string | null
  startSession: () => Promise<void>
  submitAnswers: () => Promise<void>
  generateNow: () => Promise<void>
  updateAnswer: (questionId: string, optionIds: string[]) => void
  updateFreeText: (questionId: string, text: string) => void
  canSubmit: boolean
}

export function useDesignSession({
  purpose,
  onComplete,
}: UseDesignSessionOptions): UseDesignSessionReturn {
  const [session, setSession] = useState<DesignSession | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // セッションを開始
  const startSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/forms/design-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ purpose }),
      })

      if (!response.ok) {
        throw new Error('Failed to start session')
      }

      const json = await response.json()
      const data = json.data as DesignSession

      setSession(data)
      setQuestions(data.questions ?? [])
      setAnswers(new Map())

      if (data.status === 'completed' && data.fields) {
        onComplete?.(data.fields)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [purpose, onComplete])

  // 選択肢の回答を更新
  const updateAnswer = useCallback((questionId: string, optionIds: string[]) => {
    setAnswers((prev) => {
      const next = new Map(prev)
      const current = prev.get(questionId) ?? { selectedOptionIds: [], freeText: '' }
      next.set(questionId, { ...current, selectedOptionIds: optionIds })
      return next
    })
  }, [])

  // 自由テキストを更新
  const updateFreeText = useCallback((questionId: string, text: string) => {
    setAnswers((prev) => {
      const next = new Map(prev)
      const current = prev.get(questionId) ?? { selectedOptionIds: [], freeText: '' }
      next.set(questionId, { ...current, freeText: text })
      return next
    })
  }, [])

  // 回答を送信
  const submitAnswers = useCallback(async () => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    const answerPayload: UserAnswer[] = Array.from(answers.entries()).map(
      ([questionId, answerState]) => ({
        questionId,
        selectedOptionIds: answerState.selectedOptionIds,
        freeText: answerState.freeText || undefined,
      })
    )

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/forms/design-sessions/${session.sessionId}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers: answerPayload }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to submit answers')
      }

      const json = await response.json()
      const data = json.data as {
        status: string
        questions?: Question[]
        fields?: GeneratedField[]
      }

      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: data.status as DesignSession['status'],
              questions: data.questions,
              fields: data.fields,
            }
          : null
      )
      setQuestions(data.questions ?? [])
      setAnswers(new Map())

      if (data.status === 'completed' && data.fields) {
        onComplete?.(data.fields)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [session, answers, onComplete])

  // 即座にフィールドを生成（早期離脱）
  const generateNow = useCallback(async () => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/forms/design-sessions/${session.sessionId}/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate fields')
      }

      const json = await response.json()
      const data = json.data as { fields: GeneratedField[] }

      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: 'completed',
              fields: data.fields,
            }
          : null
      )
      setQuestions([])

      onComplete?.(data.fields)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [session, onComplete])

  // 全質問に回答したかどうか（選択肢または自由テキストがあればOK）
  const canSubmit =
    questions.length > 0 &&
    questions.every((q) => {
      const answer = answers.get(q.id)
      if (!answer) return false
      return answer.selectedOptionIds.length > 0 || answer.freeText.trim().length > 0
    })

  return {
    session,
    questions,
    answers,
    isLoading,
    error,
    startSession,
    submitAnswers,
    generateNow,
    updateAnswer,
    updateFreeText,
    canSubmit,
  }
}
