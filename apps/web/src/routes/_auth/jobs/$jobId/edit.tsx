import { createFileRoute } from '@tanstack/react-router'
import { JobEditPage } from '@/components/pages'

export const Route = createFileRoute('/_auth/jobs/$jobId/edit')({
  component: () => {
    const { jobId } = Route.useParams()
    return <JobEditPage jobId={jobId} />
  },
})
