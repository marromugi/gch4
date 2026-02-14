import { cn } from '@ding/ui/lib'
import { statusBadge } from './const'
import type { FormStatus } from '../type'

const STATUS_LABELS: Record<FormStatus, string> = {
  draft: '下書き',
  published: '公開中',
  closed: 'クローズ',
}

interface StatusBadgeProps {
  status: FormStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return <span className={cn(statusBadge({ status }), className)}>{STATUS_LABELS[status]}</span>
}
