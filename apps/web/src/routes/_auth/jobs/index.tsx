import { createFileRoute } from '@tanstack/react-router'
import { JobListPage } from '@/components/pages'

export const Route = createFileRoute('/_auth/jobs/')({
  component: JobListPage,
})
