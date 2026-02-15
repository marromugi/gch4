import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  updateForm,
  saveFormFields,
  getGetFormQueryKey,
  getGetFormFieldsQueryKey,
  getGetFormSchemaQueryKey,
  getListFormsQueryKey,
} from '@/lib/api/generated/form/form'
import { useFormDetail, useFormFields, useFormSchema } from '../FormDetail/hook'
import type { FormEditFormValues } from './type'

export interface CriteriaItem {
  id?: string
  criteriaKey: string
  criteria: string
  doneCondition: string
  questioningHints: string | null
}

export interface BoundaryItem {
  value: string
}

export interface FormFieldWithCriteria {
  id: string
  formId: string
  fieldId: string
  label: string
  intent: string | null
  required: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  criteria: CriteriaItem[]
  boundaries: BoundaryItem[]
}

export function useFormEditData(formId: string) {
  const formQuery = useFormDetail(formId)
  const formFieldsQuery = useFormFields(formId, !!formQuery.data)
  const schemaQuery = useFormSchema(formId, !!formQuery.data)

  const formFieldsWithCriteria = useMemo<FormFieldWithCriteria[]>(() => {
    if (!formFieldsQuery.data) return []

    const completionCriteria = schemaQuery.data?.completionCriteria ?? []

    return formFieldsQuery.data.map((field) => {
      const fieldCriteria = completionCriteria.filter((c) => c.formFieldId === field.id)

      const criteria: CriteriaItem[] = fieldCriteria.map((c) => ({
        id: c.id,
        criteriaKey: c.factKey,
        criteria: c.fact,
        doneCondition: c.doneCriteria,
        questioningHints: c.questioningHints,
      }))

      const boundaries: BoundaryItem[] =
        fieldCriteria[0]?.boundaries?.map((b) => ({ value: b })) ?? []

      return {
        ...field,
        criteria,
        boundaries,
      }
    })
  }, [formFieldsQuery.data, schemaQuery.data])

  return {
    form: formQuery.data,
    formFields: formFieldsWithCriteria,
    schemaVersion: schemaQuery.data?.schemaVersion,
    isLoading: formQuery.isLoading || formFieldsQuery.isLoading || schemaQuery.isLoading,
    isError: formQuery.isError || formFieldsQuery.isError || schemaQuery.isError,
    error: formQuery.error || formFieldsQuery.error || schemaQuery.error,
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
          criteria: f.criteria?.map((c) => ({
            id: c.id,
            criteriaKey: c.criteriaKey,
            criteria: c.criteria,
            doneCondition: c.doneCondition,
            questioningHints: c.questioningHints,
          })),
          boundaries: f.boundaries?.map((b) => b.value),
        })
      )

      await saveFormFields(formId, { fields })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetFormQueryKey(formId) })
      queryClient.invalidateQueries({ queryKey: getGetFormFieldsQueryKey(formId) })
      queryClient.invalidateQueries({ queryKey: getGetFormSchemaQueryKey(formId) })
      queryClient.invalidateQueries({ queryKey: getListFormsQueryKey() })
      navigate({ to: '/forms/$formId', params: { formId } })
    },
  })
}
