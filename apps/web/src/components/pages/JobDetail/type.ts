import type { jobEditFormSchema } from './schema'
import type { z } from 'zod'

export interface JobDetailPageProps {
  className?: string
}

// orval 生成型を re-export
export type { GetJob200Data as JobDetail } from '@/lib/api/generated/models'
export type { GetJob200DataStatus as JobStatus } from '@/lib/api/generated/models'
export type { GetJobFormFields200DataItem as JobFormField } from '@/lib/api/generated/models'
export type { GetJobSchema200DataSchemaVersion as SchemaVersion } from '@/lib/api/generated/models'
export type { GetJobSchema200DataSchemaVersionStatus as SchemaVersionStatus } from '@/lib/api/generated/models'
export type { GetJobSchema200DataFactDefinitionsItem as FieldFactDefinition } from '@/lib/api/generated/models'
export type { GetJobSchema200DataProhibitedTopicsItem as ProhibitedTopic } from '@/lib/api/generated/models'
export type { ListJobApplications200DataItem as ApplicationItem } from '@/lib/api/generated/models'

export type JobEditFormValues = z.infer<typeof jobEditFormSchema>
