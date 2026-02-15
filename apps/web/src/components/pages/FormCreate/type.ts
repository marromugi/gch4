import type { formCreateFormSchema } from './schema'
import type { z } from 'zod'

export interface FormCreatePageProps {
  className?: string
}

export type FormCreateFormValues = z.infer<typeof formCreateFormSchema>

export interface CriteriaItem {
  criteriaKey: string
  criteria: string
  doneCondition: string
  questioningHints: string | null
}

export interface BoundaryItem {
  value: string
}

export interface FormFieldItem {
  label: string
  intent: string
  required: boolean
  criteria?: CriteriaItem[]
  boundaries?: BoundaryItem[]
}

export interface CreateFormRequest {
  title: string
  purpose: string | null
  completionMessage: string | null
  fields: Array<{
    label: string
    intent: string
    required: boolean
    criteria?: CriteriaItem[]
    boundaries?: string[]
  }>
}

export interface CreateFormResponse {
  data: {
    id: string
    title: string
    status: 'draft'
  }
}
