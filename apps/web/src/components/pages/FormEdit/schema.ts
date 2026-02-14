import { z } from 'zod'

const formFieldSchema = z.object({
  id: z.string().optional(),
  fieldId: z.string().optional(),
  label: z.string().min(1, 'ラベルは必須です'),
  intent: z.string(),
  required: z.boolean(),
  sortOrder: z.number().optional(),
})

export const formEditFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  purpose: z.string().nullable(),
  completionMessage: z.string().nullable(),
  formFields: z.array(formFieldSchema).min(1, 'フォーム項目を1つ以上追加してください'),
})
