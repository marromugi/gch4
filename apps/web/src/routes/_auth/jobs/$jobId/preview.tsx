import { Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { JobApplicationPage } from '@/components/pages'
import { useCreateApplication } from '@/lib/api/generated/application/application'
import { useGetJob, useGetJobSchema } from '@/lib/api/generated/job/job'

export const Route = createFileRoute('/_auth/jobs/$jobId/preview')({
  component: PreviewRoute,
})

function PreviewRoute() {
  const { jobId } = Route.useParams()
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const createdRef = useRef(false)

  const { data: schemaData, isLoading: isLoadingSchema } = useGetJobSchema(jobId)
  const { data: jobData } = useGetJob(jobId)
  const { mutateAsync: createApplication } = useCreateApplication()

  const schemaVersionId = schemaData?.data?.schemaVersion?.id

  useEffect(() => {
    if (!schemaVersionId || createdRef.current) return
    createdRef.current = true

    createApplication({
      data: { jobId, schemaVersionId },
    })
      .then((res) => {
        setApplicationId(res.data.id)
      })
      .catch(() => {
        setError('テスト用応募の作成に失敗しました')
      })
  }, [jobId, schemaVersionId, createApplication])

  if (isLoadingSchema || (!applicationId && !error)) {
    return (
      <Flex justify="center" align="center" className="min-h-dvh">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-600 dark:border-t-neutral-50" />
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex justify="center" align="center" className="min-h-dvh">
        <Typography variant="alert" size="sm">
          {error}
        </Typography>
      </Flex>
    )
  }

  return (
    <JobApplicationPage
      applicationId={applicationId!}
      mode="preview"
      jobId={jobId}
      jobTitle={jobData?.data?.title}
      backHref={`/jobs/${jobId}`}
    />
  )
}
