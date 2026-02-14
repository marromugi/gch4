import { createFileRoute } from '@tanstack/react-router'
import { FormResponsePage } from '@/components/pages'

export const Route = createFileRoute('/respond/$submissionId')({
  component: () => {
    const { submissionId } = Route.useParams()
    return <FormResponsePage submissionId={submissionId} />
  },
})
