import { useQueryClient } from '@tanstack/react-query'
import {
  useGetJob,
  useGetJobFormFields,
  useGetJobSchema,
  useListJobApplications,
  useUpdateJob,
  usePublishJob,
  useCloseJob,
  useSaveJobFormFields,
  useApproveJobSchemaVersion,
  getGetJobQueryKey,
  getGetJobFormFieldsQueryKey,
  getGetJobSchemaQueryKey,
  getListJobsQueryKey,
} from '@/lib/api/generated/job/job'

// ─── Query Hooks ───────────────────────────────────────

export function useJobDetail(jobId: string) {
  return useGetJob(jobId, {
    query: {
      enabled: !!jobId,
      select: (data) => data.data,
    },
  })
}

export function useJobFormFields(jobId: string, enabled: boolean) {
  return useGetJobFormFields(jobId, {
    query: {
      enabled: !!jobId && enabled,
      select: (data) => data.data,
    },
  })
}

export function useJobSchema(jobId: string, enabled: boolean) {
  return useGetJobSchema(jobId, {
    query: {
      enabled: !!jobId && enabled,
      select: (data) => data.data,
    },
  })
}

export function useJobApplications(jobId: string, enabled: boolean) {
  return useListJobApplications(jobId, {
    query: {
      enabled: !!jobId && enabled,
      select: (data) => data.data,
    },
  })
}

// ─── Mutation Hooks ────────────────────────────────────

export function useUpdateJobMutation(jobId: string) {
  const queryClient = useQueryClient()

  return useUpdateJob({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) })
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() })
      },
    },
  })
}

export function usePublishJobMutation(jobId: string) {
  const queryClient = useQueryClient()

  return usePublishJob({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) })
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() })
      },
    },
  })
}

export function useCloseJobMutation(jobId: string) {
  const queryClient = useQueryClient()

  return useCloseJob({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) })
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() })
      },
    },
  })
}

export function useSaveFormFieldsMutation(jobId: string) {
  const queryClient = useQueryClient()

  return useSaveJobFormFields({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetJobFormFieldsQueryKey(jobId) })
        queryClient.invalidateQueries({ queryKey: getGetJobSchemaQueryKey(jobId) })
      },
    },
  })
}

export function useApproveSchemaVersionMutation(jobId: string) {
  const queryClient = useQueryClient()

  return useApproveJobSchemaVersion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetJobSchemaQueryKey(jobId) })
      },
    },
  })
}
