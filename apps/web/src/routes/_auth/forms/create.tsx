import { createFileRoute } from '@tanstack/react-router'
import { FormCreatePage } from '@/components/pages'

export const Route = createFileRoute('/_auth/forms/create')({
  component: FormCreatePage,
})
