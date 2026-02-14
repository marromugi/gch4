import { Typography } from '@ding/ui'
import { useEnterAction } from '@ding/ui/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatBubble } from '../ChatBubble'
import { ThinkingLoader } from '../ThinkingLoader'
import { chatPanel } from './const'
import type { ChatPanelProps } from './type'

export function ChatPanel({ messages, isSending, isComplete, onSendMessage }: ChatPanelProps) {
  const styles = chatPanel()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // 新着メッセージで自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return
    onSendMessage(trimmed)
    setInput('')
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
    }
  }, [input, isSending, onSendMessage])

  const { handlers } = useEnterAction({
    mode: 'newline',
    onSubmit: handleSubmit,
  })

  const adjustTextAreaHeight = useCallback(() => {
    const textarea = textAreaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [])

  useEffect(() => {
    adjustTextAreaHeight()
  }, [input, adjustTextAreaHeight])

  return (
    <div className={styles.container()}>
      <div className={styles.messageList()}>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} content={msg.content} role={msg.role} />
        ))}
        {isSending && <ThinkingLoader />}
        <div ref={messagesEndRef} />
      </div>

      {isComplete ? (
        <div className={styles.completeMessage()}>
          <Typography variant="description" size="sm">
            チャットが完了しました。内容を確認してください。
          </Typography>
        </div>
      ) : (
        <div className={styles.inputArea()}>
          <div className={styles.inputCard()}>
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              rows={1}
              disabled={isSending}
              className={styles.inputTextarea()}
              {...handlers}
            />
            <div className={styles.inputButtonContainer()}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() || isSending}
                className={styles.inputButton()}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
