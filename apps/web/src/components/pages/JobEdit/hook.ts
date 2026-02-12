import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  updateJob,
  saveJobFormFields,
  getGetJobQueryKey,
  getGetJobFormFieldsQueryKey,
  getListJobsQueryKey,
} from '@/lib/api/generated/job/job'
import { useJobDetail, useJobFormFields } from '../JobDetail/hook'
import type { JobEditFormValues } from './type'

export function useJobEditData(jobId: string) {
  const jobQuery = useJobDetail(jobId)
  const formFieldsQuery = useJobFormFields(jobId, !!jobQuery.data)

  return {
    job: jobQuery.data,
    formFields: formFieldsQuery.data ?? [],
    isLoading: jobQuery.isLoading || formFieldsQuery.isLoading,
    isError: jobQuery.isError || formFieldsQuery.isError,
    error: jobQuery.error || formFieldsQuery.error,
  }
}

export function useUpdateJobEditMutation(jobId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (values: JobEditFormValues) => {
      await updateJob(jobId, {
        title: values.title,
        idealCandidate: values.idealCandidate,
        cultureContext: values.cultureContext,
      })

      const fields = values.formFields.map((f, i) => ({
        id: f.id ?? '',
        fieldId: f.fieldId ?? '',
        label: f.label,
        intent: f.intent,
        required: f.required,
        sortOrder: f.sortOrder ?? i,
      }))

      await saveJobFormFields(jobId, { fields })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) })
      queryClient.invalidateQueries({ queryKey: getGetJobFormFieldsQueryKey(jobId) })
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() })
      navigate({ to: '/jobs/$jobId', params: { jobId } })
    },
  })
}
