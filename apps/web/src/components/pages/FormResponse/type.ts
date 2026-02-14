export type Phase = 'chat' | 'review' | 'consent' | 'complete'

export type ResponseMode = 'live' | 'preview'

export interface FormResponsePageProps {
  submissionId: string
  mode?: ResponseMode
  formId?: string
  formTitle?: string
  className?: string
  backHref?: string
}

export type { GetSubmission200Data as SubmissionData } from '@/lib/api/generated/models'
export type { GetChatSession200DataMessagesItem as ChatMessage } from '@/lib/api/generated/models'
export type { GetChatSession200DataTodosItem as TodoItem } from '@/lib/api/generated/models'
export type { GetChatSession200DataTodosItemStatus as TodoStatus } from '@/lib/api/generated/models'
export type { GetChatSession200DataMessagesItemRole as MessageRole } from '@/lib/api/generated/models'
export type { CreateChatSession201DataSession as ChatSessionData } from '@/lib/api/generated/models'
