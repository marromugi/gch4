import { cn } from '@ding/ui/lib'
import { statusBadge } from './const'
import type { JobStatus } from '../type'

const STATUS_LABELS: Record<JobStatus, string> = {
  draft: '下書き',
  open: '公開中',
  closed: 'クローズ',
}

interface StatusBadgeProps {
  status: JobStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return <span className={cn(statusBadge({ status }), className)}>{STATUS_LABELS[status]}</span>
}
