import { Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { FormResponsePage } from '@/components/pages'
import { useGetForm, useGetFormSchema } from '@/lib/api/generated/form/form'
import { useCreateSubmission } from '@/lib/api/generated/submission/submission'

export const Route = createFileRoute('/_auth/forms/$formId/preview')({
  component: PreviewRoute,
})

function PreviewRoute() {
  const { formId } = Route.useParams()
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const createdRef = useRef(false)

  const { data: schemaData, isLoading: isLoadingSchema } = useGetFormSchema(formId)
  const { data: formData } = useGetForm(formId)
  const { mutateAsync: createSubmission } = useCreateSubmission()

  const schemaVersionId = schemaData?.data?.schemaVersion?.id

  useEffect(() => {
    if (!schemaVersionId || createdRef.current) return
    createdRef.current = true

    createSubmission({
      data: { formId, schemaVersionId },
    })
      .then((res) => {
        setSubmissionId(res.data.id)
      })
      .catch(() => {
        setError('テスト用回答の作成に失敗しました')
      })
  }, [formId, schemaVersionId, createSubmission])

  if (isLoadingSchema || (!submissionId && !error)) {
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
    <FormResponsePage
      submissionId={submissionId!}
      mode="preview"
      formId={formId}
      formTitle={formData?.data?.title}
      backHref={`/forms/${formId}`}
    />
  )
}
