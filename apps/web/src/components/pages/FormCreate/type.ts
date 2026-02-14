import type { formCreateFormSchema } from './schema'
import type { z } from 'zod'

export interface FormCreatePageProps {
  className?: string
}

export type FormCreateFormValues = z.infer<typeof formCreateFormSchema>

export interface FormFieldItem {
  label: string
  intent: string
  required: boolean
}

export interface CreateFormRequest {
  title: string
  purpose: string | null
  completionMessage: string | null
  formFields: FormFieldItem[]
}

export interface CreateFormResponse {
  data: {
    id: string
    title: string
    status: 'draft'
  }
}
