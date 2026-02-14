import { createFileRoute } from '@tanstack/react-router'
import { FormListPage } from '@/components/pages'

export const Route = createFileRoute('/_auth/forms/')({
  component: FormListPage,
})
