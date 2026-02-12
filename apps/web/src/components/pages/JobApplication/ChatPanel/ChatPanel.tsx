import { Button, TextArea, Typography } from '@ding/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatBubble } from '../ChatBubble'
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
  }, [input, isSending, onSendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className={styles.container()}>
      <div className={styles.messageList()}>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} content={msg.content} role={msg.role} />
        ))}
        {isSending && <ChatBubble content="..." role="assistant" />}
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
          <div className={styles.inputRow()}>
            <TextArea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              rows={1}
              resize="none"
              disabled={isSending}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!input.trim() || isSending}
            >
              送信
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
