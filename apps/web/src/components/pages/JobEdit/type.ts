import type { jobEditFormSchema } from './schema'
import type { z } from 'zod'

export interface JobEditPageProps {
  jobId: string
  className?: string
}

export type JobEditFormValues = z.infer<typeof jobEditFormSchema>
