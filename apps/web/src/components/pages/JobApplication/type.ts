export type Phase = 'chat' | 'review' | 'consent' | 'complete'

export type ApplicationMode = 'live' | 'preview'

export interface JobApplicationPageProps {
  applicationId: string
  mode?: ApplicationMode
  jobId?: string
  jobTitle?: string
  className?: string
  backHref?: string
}

export type { GetApplication200Data as ApplicationData } from '@/lib/api/generated/models'
export type { GetChatSession200DataMessagesItem as ChatMessage } from '@/lib/api/generated/models'
export type { GetChatSession200DataTodosItem as TodoItem } from '@/lib/api/generated/models'
export type { GetChatSession200DataTodosItemStatus as TodoStatus } from '@/lib/api/generated/models'
export type { GetChatSession200DataMessagesItemRole as MessageRole } from '@/lib/api/generated/models'
export type { CreateChatSession201DataSession as ChatSessionData } from '@/lib/api/generated/models'
