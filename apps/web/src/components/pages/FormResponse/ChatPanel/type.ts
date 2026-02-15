import type { ChatMessage } from '../type'
import type { AskOptionsData } from '@/lib/api/v3'

export interface ChatPanelProps {
  messages: ChatMessage[]
  isSending: boolean
  isComplete: boolean
  onSendMessage: (content: string) => void
  askOptions?: AskOptionsData | null
  onOptionSubmit?: (selectedIds: string[], freeText?: string) => void
}
