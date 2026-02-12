import type { jobCreateFormSchema } from './schema'
import type { z } from 'zod'

export interface JobCreatePageProps {
  className?: string
}

export type JobCreateFormValues = z.infer<typeof jobCreateFormSchema>

export interface FormFieldItem {
  label: string
  intent: string
  required: boolean
}

export interface CreateJobRequest {
  title: string
  idealCandidate: string | null
  cultureContext: string | null
  formFields: FormFieldItem[]
}

export interface CreateJobResponse {
  data: {
    id: string
    title: string
    status: 'draft'
  }
}
