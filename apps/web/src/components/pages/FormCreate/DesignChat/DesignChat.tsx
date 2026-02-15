import { useEffect } from 'react'
import { completeMessage, designChat, footerButton } from './const'
import { useDesignSession } from './hook'
import { QuestionCard } from './QuestionCard'
import type { DesignChatProps } from './type'

export function DesignChat({ purpose, onComplete }: DesignChatProps) {
  const styles = designChat()
  const completeStyles = completeMessage()

  const {
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
  } = useDesignSession({ purpose, onComplete })

  // 初回マウント時にセッションを開始
  useEffect(() => {
    startSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // エラー表示
  if (error) {
    return (
      <div className={styles.container()}>
        <div className={styles.content()}>
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              type="button"
              className={footerButton({ variant: 'secondary' })}
              onClick={startSession}
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 完了画面
  if (session?.status === 'completed') {
    return (
      <div className={styles.container()}>
        <div className={styles.content()}>
          <div className={completeStyles.container()}>
            <div className={completeStyles.icon()}>&#10003;</div>
            <h2 className={completeStyles.title()}>フィールドを生成しました</h2>
            <p className={completeStyles.description()}>
              {session.fields?.length ?? 0}個のフィールドが作成されました
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ローディング（セッション開始中 or 質問が空）
  if (isLoading || questions.length === 0) {
    return (
      <div className={styles.container()}>
        <div className={styles.content()}>
          <div className={styles.loadingContainer()}>
            <div className={styles.loadingSpinner()} />
            <span className={styles.loadingText()}>
              {isLoading ? '処理中...' : '質問を準備しています...'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container()}>
      <div className={styles.content()}>
        {questions.map((question) => {
          const answer = answers.get(question.id)
          return (
            <QuestionCard
              key={question.id}
              question={question}
              selectedOptionIds={answer?.selectedOptionIds ?? []}
              freeText={answer?.freeText ?? ''}
              onSelectionChange={updateAnswer}
              onFreeTextChange={updateFreeText}
              disabled={isLoading}
            />
          )
        })}
      </div>

      <div className={styles.footer()}>
        <div className="space-y-3">
          <button
            type="button"
            className={footerButton({ variant: 'primary' })}
            onClick={submitAnswers}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? '送信中...' : '次へ'}
          </button>
          <button
            type="button"
            className={footerButton({ variant: 'secondary' })}
            onClick={generateNow}
            disabled={isLoading}
          >
            ここまでの情報でフィールドを生成
          </button>
        </div>
      </div>
    </div>
  )
}
