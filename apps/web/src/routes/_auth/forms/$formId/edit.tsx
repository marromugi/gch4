import { createFileRoute } from '@tanstack/react-router'
import { FormEditPage } from '@/components/pages'

export const Route = createFileRoute('/_auth/forms/$formId/edit')({
  component: () => {
    const { formId } = Route.useParams()
    return <FormEditPage formId={formId} />
  },
})
