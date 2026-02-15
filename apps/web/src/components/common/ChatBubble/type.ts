export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatBubbleProps {
  content: string
  role: MessageRole
}
