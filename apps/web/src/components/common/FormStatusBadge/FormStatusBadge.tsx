import { formStatusBadge, formStatusIcons, formStatusLabels } from './const'
import type { FormStatusBadgeProps } from './type'

export function FormStatusBadge({ status, className }: FormStatusBadgeProps) {
  const Icon = formStatusIcons[status]
  return (
    <span className={formStatusBadge({ status, className })}>
      <Icon className="size-4" />
      {formStatusLabels[status]}
    </span>
  )
}
