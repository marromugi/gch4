import { createFileRoute } from '@tanstack/react-router'
import { FormDetailPage } from '@/components/pages'

export const Route = createFileRoute('/_auth/forms/$formId/')({
  component: () => {
    const { formId } = Route.useParams()
    return <FormDetailPage formId={formId} />
  },
})
