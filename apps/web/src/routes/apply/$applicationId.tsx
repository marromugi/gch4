import { createFileRoute } from '@tanstack/react-router'
import { JobApplicationPage } from '@/components/pages'

export const Route = createFileRoute('/apply/$applicationId')({
  component: () => {
    const { applicationId } = Route.useParams()
    return <JobApplicationPage applicationId={applicationId} />
  },
})
