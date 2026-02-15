import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_BASE_URL } from '@/lib/api/fetcher'
import {
  useGetForm,
  useGetFormFields,
  useGetFormSchema,
  useListFormSubmissions,
  useUpdateForm,
  usePublishForm,
  useCloseForm,
  useSaveFormFields,
  getGetFormQueryKey,
  getGetFormFieldsQueryKey,
  getGetFormSchemaQueryKey,
  getListFormsQueryKey,
} from '@/lib/api/generated/form/form'

// ─── Query Hooks ───────────────────────────────────────

export function useFormDetail(formId: string) {
  return useGetForm(formId, {
    query: {
      enabled: !!formId,
      select: (data) => data.data,
    },
  })
}

export function useFormFields(formId: string, enabled: boolean) {
  return useGetFormFields(formId, {
    query: {
      enabled: !!formId && enabled,
      select: (data) => data.data,
    },
  })
}

export function useFormSchema(formId: string, enabled: boolean) {
  return useGetFormSchema(formId, {
    query: {
      enabled: !!formId && enabled,
      select: (data) => data.data,
    },
  })
}

export function useFormSubmissions(formId: string, enabled: boolean) {
  return useListFormSubmissions(formId, {
    query: {
      enabled: !!formId && enabled,
      select: (data) => data.data,
    },
  })
}

// ─── Mutation Hooks ────────────────────────────────────

export function useUpdateFormMutation(formId: string) {
  const queryClient = useQueryClient()

  return useUpdateForm({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFormQueryKey(formId) })
        queryClient.invalidateQueries({ queryKey: getListFormsQueryKey() })
      },
    },
  })
}

export function usePublishFormMutation(formId: string) {
  const queryClient = useQueryClient()

  return usePublishForm({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFormQueryKey(formId) })
        queryClient.invalidateQueries({ queryKey: getListFormsQueryKey() })
      },
    },
  })
}

export function useCloseFormMutation(formId: string) {
  const queryClient = useQueryClient()

  return useCloseForm({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFormQueryKey(formId) })
        queryClient.invalidateQueries({ queryKey: getListFormsQueryKey() })
      },
    },
  })
}

export function useSaveFormFieldsMutation(formId: string) {
  const queryClient = useQueryClient()

  return useSaveFormFields({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetFormFieldsQueryKey(formId) })
        queryClient.invalidateQueries({ queryKey: getGetFormSchemaQueryKey(formId) })
      },
    },
  })
}

export function useDeleteFormMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/forms/${formId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error((error as { error?: string }).error ?? `HTTP Error: ${response.status}`)
      }

      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListFormsQueryKey() })
    },
  })
}
