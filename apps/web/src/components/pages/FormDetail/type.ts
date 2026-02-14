import type { formEditFormSchema } from './schema'
import type { z } from 'zod'

export interface FormDetailPageProps {
  formId: string
  className?: string
}

// orval 生成型を re-export
export type { GetForm200Data as FormDetail } from '@/lib/api/generated/models'
export type { GetForm200DataStatus as FormStatus } from '@/lib/api/generated/models'
export type { GetFormFields200DataItem as FormField } from '@/lib/api/generated/models'
export type { GetFormSchema200DataSchemaVersion as SchemaVersion } from '@/lib/api/generated/models'
export type { GetFormSchema200DataSchemaVersionStatus as SchemaVersionStatus } from '@/lib/api/generated/models'
export type { GetFormSchema200DataCompletionCriteriaItem as FieldCompletionCriteria } from '@/lib/api/generated/models'
export type { ListFormSubmissions200DataItem as SubmissionItem } from '@/lib/api/generated/models'

export type FormEditFormValues = z.infer<typeof formEditFormSchema>
