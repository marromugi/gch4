import { z } from 'zod'

export const formEditFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  purpose: z.string().nullable(),
  completionMessage: z.string().nullable(),
})

const formFieldItemSchema = z.object({
  id: z.string().optional(),
  fieldId: z.string().optional(),
  label: z.string().min(1, 'ラベルは必須です'),
  intent: z.string(),
  required: z.boolean(),
  sortOrder: z.number(),
})

export const formFieldsEditSchema = z.object({
  fields: z.array(formFieldItemSchema).min(1, 'フォーム項目を1つ以上追加してください'),
})

export type FormFieldsEditValues = z.infer<typeof formFieldsEditSchema>
