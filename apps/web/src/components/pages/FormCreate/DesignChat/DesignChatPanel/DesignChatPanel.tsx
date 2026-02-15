import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatBubble } from '@/components/common/ChatBubble'
import { ThinkingLoader } from '@/components/common/ThinkingLoader'
import { useDesignSession } from '../hook'
import { designChatPanel, optionItem, optionsSelector } from './const'
import type { GeneratedField, Question, QuestionOption, SelectionType } from '../type'

interface DesignChatPanelProps {
  purpose: string
  onComplete: (fields: GeneratedField[]) => void
}

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export function DesignChatPanel({ purpose, onComplete }: DesignChatPanelProps) {
  const styles = designChatPanel()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // チャットメッセージの状態
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const { session, questions, isLoading, error, startSession, generateNow } = useDesignSession({
    purpose,
    onComplete,
  })

  // 初回マウント時にセッションを開始
  useEffect(() => {
    startSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 質問が取得されたら最初の質問をチャットに追加
  useEffect(() => {
    if (questions.length > 0 && !isInitialized) {
      const firstQuestion = questions[0]
      setChatMessages([
        {
          id: `assistant-${firstQuestion.id}`,
          role: 'assistant',
          content: firstQuestion.question,
        },
      ])
      setIsInitialized(true)
    }
  }, [questions, isInitialized])

  // 新着メッセージで自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // 回答が送信されたら
  const handleAnswerSubmit = useCallback(
    async (selectedIds: string[], freeText?: string) => {
      const currentQuestion = questions[currentQuestionIndex]
      if (!currentQuestion) return

      // 選択肢のラベルを取得
      const selectedLabels = currentQuestion.options
        .filter((opt) => selectedIds.includes(opt.id))
        .map((opt) => opt.label)

      // ユーザーの回答をメッセージに追加
      const userMessageContent = freeText
        ? [...selectedLabels, freeText].join('、')
        : selectedLabels.join('、')

      setChatMessages((prev) => [
        ...prev,
        {
          id: `user-${currentQuestion.id}`,
          role: 'user',
          content: userMessageContent || '（回答なし）',
        },
      ])

      const nextIndex = currentQuestionIndex + 1

      if (nextIndex < questions.length) {
        // 次の質問がある場合
        const nextQuestion = questions[nextIndex]
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              id: `assistant-${nextQuestion.id}`,
              role: 'assistant',
              content: nextQuestion.question,
            },
          ])
          setCurrentQuestionIndex(nextIndex)
        }, 300)
      } else {
        // 全質問完了 - フィールドを生成
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              id: 'assistant-generating',
              role: 'assistant',
              content: 'ありがとうございます。回答を元にフォーム項目を生成しています...',
            },
          ])
          generateNow()
        }, 300)
      }
    },
    [questions, currentQuestionIndex, generateNow]
  )

  // 早期生成
  const handleGenerateNow = useCallback(() => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: 'assistant-generating-early',
        role: 'assistant',
        content: 'ここまでの情報でフォーム項目を生成しています...',
      },
    ])
    generateNow()
  }, [generateNow])

  // エラー表示
  if (error) {
    return (
      <div className={styles.container()}>
        <div className={styles.errorContainer()}>
          <p className={styles.errorText()}>{error}</p>
          <button type="button" className={styles.secondaryButton()} onClick={startSession}>
            再試行
          </button>
        </div>
      </div>
    )
  }

  // 完了画面
  if (session?.status === 'completed') {
    return (
      <div className={styles.container()}>
        <div className={styles.completeContainer()}>
          <div className={styles.completeIcon()}>&#10003;</div>
          <h2 className={styles.completeTitle()}>フィールドを生成しました</h2>
          <p className={styles.completeDescription()}>
            {session.fields?.length ?? 0}個のフィールドが作成されました
          </p>
        </div>
      </div>
    )
  }

  // ローディング（セッション開始中 or 質問が空）
  if (isLoading && chatMessages.length === 0) {
    return (
      <div className={styles.container()}>
        <div className={styles.loadingContainer()}>
          <div className={styles.loadingSpinner()} />
          <span className={styles.loadingText()}>質問を準備しています...</span>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className={styles.container()}>
      <div className={styles.messageList()}>
        {chatMessages.map((msg) => (
          <ChatBubble key={msg.id} content={msg.content} role={msg.role} />
        ))}
        {isLoading && <ThinkingLoader />}
        <div ref={messagesEndRef} />
      </div>

      {currentQuestion && !isLoading && (
        <div className={styles.inputArea()}>
          <div className={styles.inputCard()}>
            <QuestionOptions
              question={currentQuestion}
              onSubmit={handleAnswerSubmit}
              disabled={isLoading}
            />
            <div className={styles.footerActions()}>
              <button
                type="button"
                className={styles.secondaryButton()}
                onClick={handleGenerateNow}
                disabled={isLoading}
              >
                ここまでの情報でフィールドを生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// QuestionOptions コンポーネント
function QuestionOptions({
  question,
  onSubmit,
  disabled,
}: {
  question: Question
  onSubmit: (selectedIds: string[], freeText?: string) => void
  disabled?: boolean
}) {
  const styles = optionsSelector()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')

  // 質問が変わったらリセット
  useEffect(() => {
    setSelectedIds([])
    setFreeText('')
  }, [question.id])

  const handleToggle = (optionId: string) => {
    if (question.selectionType === 'radio') {
      setSelectedIds([optionId])
    } else {
      setSelectedIds((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      )
    }
  }

  const handleSubmit = () => {
    onSubmit(selectedIds, freeText || undefined)
  }

  const canSubmit = selectedIds.length > 0 || freeText.trim()

  return (
    <div>
      <div className={styles.container()}>
        {question.options.map((option) => (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={selectedIds.includes(option.id)}
            selectionType={question.selectionType}
            onToggle={() => handleToggle(option.id)}
            disabled={disabled}
          />
        ))}
      </div>

      <div className={styles.freeTextContainer()}>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="その他（自由入力）"
          disabled={disabled}
          className={styles.freeTextInput()}
          rows={2}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || disabled}
        className={designChatPanel().submitButton()}
        style={{ marginTop: '1rem' }}
      >
        回答を送信
      </button>
    </div>
  )
}

// OptionItem コンポーネント
function OptionItem({
  option,
  isSelected,
  selectionType,
  onToggle,
  disabled,
}: {
  option: QuestionOption
  isSelected: boolean
  selectionType: SelectionType
  onToggle: () => void
  disabled?: boolean
}) {
  const styles = optionItem({ selected: isSelected, selectionType, disabled })

  return (
    <button type="button" className={styles.button()} onClick={onToggle} disabled={disabled}>
      <span className={styles.indicator()}>
        <span className={styles.indicatorInner()} />
      </span>
      <span className={styles.label()}>{option.label}</span>
    </button>
  )
}
