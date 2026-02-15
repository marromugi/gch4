import { statusBadge, statusLabels } from './const'
import type { StatusBadgeProps } from './type'

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return <span className={statusBadge({ status, className })}>{statusLabels[status]}</span>
}
