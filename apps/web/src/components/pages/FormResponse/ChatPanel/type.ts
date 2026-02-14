import type { ChatMessage } from '../type'

export interface ChatPanelProps {
  messages: ChatMessage[]
  isSending: boolean
  isComplete: boolean
  onSendMessage: (content: string) => void
}
