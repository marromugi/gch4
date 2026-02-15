import { createFileRoute } from '@tanstack/react-router'
import { FormResponseV3Page } from '@/components/pages'
import { useGetForm } from '@/lib/api/generated/form/form'

export const Route = createFileRoute('/_auth/forms/$formId/preview')({
  component: PreviewRoute,
})

function PreviewRoute() {
  const { formId } = Route.useParams()
  const { data: formData } = useGetForm(formId)

  return (
    <FormResponseV3Page
      formId={formId}
      formTitle={formData?.data?.title}
      backHref={`/forms/${formId}`}
    />
  )
}
