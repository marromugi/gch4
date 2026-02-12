import { createFileRoute } from '@tanstack/react-router'
import { JobCreatePage } from '@/components/pages'

export const Route = createFileRoute('/_auth/jobs/create')({
  component: JobCreatePage,
})
