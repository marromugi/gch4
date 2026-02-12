import { z } from 'zod'

export const stepBasicInfoSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
})

export const stepCandidateProfileSchema = z.object({
  idealCandidate: z.string().nullable(),
  cultureContext: z.string().nullable(),
})

const formFieldSchema = z.object({
  label: z.string().min(1, 'ラベルは必須です'),
  intent: z.string(),
  required: z.boolean(),
})

export const stepFormFieldsSchema = z.object({
  formFields: z.array(formFieldSchema).min(1, 'フォーム項目を1つ以上追加してください'),
})

export const jobCreateFormSchema = stepBasicInfoSchema
  .merge(stepCandidateProfileSchema)
  .merge(stepFormFieldsSchema)
