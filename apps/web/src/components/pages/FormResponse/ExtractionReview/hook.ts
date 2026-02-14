import { useCallback, useState } from 'react'
import type { TodoItem } from '../type'

export function useExtractionReview(todos: TodoItem[], onComplete: () => Promise<void>) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 抽出結果確認のためフィルタ（done or manual_input のみ表示）
  const reviewTodos = todos.filter((t) => t.status === 'done' || t.status === 'manual_input')

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await onComplete()
    } finally {
      setIsSubmitting(false)
    }
  }, [onComplete])

  return {
    reviewTodos,
    isSubmitting,
    handleSubmit,
  }
}
