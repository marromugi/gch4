import type { GetForm200DataStatus } from '@/lib/api/generated/models'

export type FormStatus = GetForm200DataStatus

export interface FormStatusBadgeProps {
  status: FormStatus
  className?: string
}
