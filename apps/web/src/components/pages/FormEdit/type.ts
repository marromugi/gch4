import type { formEditFormSchema } from './schema'
import type { z } from 'zod'

export interface FormEditPageProps {
  formId: string
  className?: string
}

export type FormEditFormValues = z.infer<typeof formEditFormSchema>
