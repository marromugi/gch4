import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  updateForm,
  saveFormFields,
  getGetFormQueryKey,
  getGetFormFieldsQueryKey,
  getListFormsQueryKey,
} from '@/lib/api/generated/form/form'
import { useFormDetail, useFormFields } from '../FormDetail/hook'
import type { FormEditFormValues } from './type'

export function useFormEditData(formId: string) {
  const formQuery = useFormDetail(formId)
  const formFieldsQuery = useFormFields(formId, !!formQuery.data)

  return {
    form: formQuery.data,
    formFields: formFieldsQuery.data ?? [],
    isLoading: formQuery.isLoading || formFieldsQuery.isLoading,
    isError: formQuery.isError || formFieldsQuery.isError,
    error: formQuery.error || formFieldsQuery.error,
  }
}

export function useUpdateFormEditMutation(formId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (values: FormEditFormValues) => {
      await updateForm(formId, {
        title: values.title,
        purpose: values.purpose,
        completionMessage: values.completionMessage,
      })

      const fields = values.formFields.map(
        (f: FormEditFormValues['formFields'][number], i: number) => ({
          id: f.id ?? '',
          fieldId: f.fieldId ?? '',
          label: f.label,
          intent: f.intent,
          required: f.required,
          sortOrder: f.sortOrder ?? i,
        })
      )

      await saveFormFields(formId, { fields })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetFormQueryKey(formId) })
      queryClient.invalidateQueries({ queryKey: getGetFormFieldsQueryKey(formId) })
      queryClient.invalidateQueries({ queryKey: getListFormsQueryKey() })
      navigate({ to: '/forms/$formId', params: { formId } })
    },
  })
}
