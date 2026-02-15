import { Button, FormFieldWrapper, TextArea, TextField, Typography } from '@ding/ui'
import { AddFill } from '@ding/ui/icon'
import { Flex } from '@ding/ui/layout'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { FormFieldItemRow } from '@/components/common/FormFieldItem'
import { Controller, useZodForm } from '@/lib/hook-form'
import { useFormFieldsSuggest } from '../FormCreate/StepFormFields/hooks'
import { formEditPage } from './const'
import { useFormEditData, useUpdateFormEditMutation } from './hook'
import { formEditFormSchema } from './schema'
import type { FormEditFormValues, FormEditPageProps } from './type'
import type { FormField } from '../FormDetail/type'

export function FormEditPage({ formId, className }: FormEditPageProps) {
  const styles = formEditPage()
  const navigate = useNavigate()
  const { form, formFields, isLoading, isError } = useFormEditData(formId)

  useEffect(() => {
    if (form && form.status !== 'draft') {
      navigate({ to: '/forms/$formId', params: { formId } })
    }
  }, [form, formId, navigate])

  if (isLoading) {
    return (
      <div className={styles.loadingState()}>
        <div className={styles.spinner()} />
      </div>
    )
  }

  if (isError || !form) {
    return (
      <div className={styles.loadingState()}>
        <Typography variant="alert" size="md">
          フォーム情報の取得に失敗しました
        </Typography>
      </div>
    )
  }

  if (form.status !== 'draft') {
    return null
  }

  return (
    <FormEditForm formId={formId} formData={form} formFields={formFields} className={className} />
  )
}

interface FormEditFormProps {
  formId: string
  formData: { title: string; purpose: string | null; completionMessage: string | null }
  formFields: FormField[]
  className?: string
}

function FormEditForm({
  formId,
  formData,
  formFields: initialFormFields,
  className,
}: FormEditFormProps) {
  const styles = formEditPage()
  const navigate = useNavigate()
  const mutation = useUpdateFormEditMutation(formId)

  const form = useZodForm<FormEditFormValues>({
    schema: formEditFormSchema,
    defaultValues: {
      title: formData.title,
      purpose: formData.purpose,
      completionMessage: formData.completionMessage,
      formFields:
        initialFormFields.length > 0
          ? initialFormFields.map((f: FormField) => ({
              id: f.id,
              fieldId: f.fieldId,
              label: f.label,
              intent: f.intent ?? '',
              required: f.required,
              sortOrder: f.sortOrder,
            }))
          : [{ label: '', intent: '', required: false }],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'formFields',
  })

  const {
    suggest: suggestFormFields,
    formFields: suggestedFields,
    isLoading: isFormFieldsLoading,
    error: formFieldsError,
  } = useFormFieldsSuggest()

  const handleSuggestFormFields = () => {
    const title = form.getValues('title')
    if (!title || isFormFieldsLoading) return
    suggestFormFields(title, form.getValues('purpose'))
  }

  useEffect(() => {
    if (suggestedFields) {
      replace(suggestedFields)
    }
  }, [suggestedFields, replace])

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values)
  })

  const formFieldsRootError =
    form.formState.errors.formFields?.root?.message ?? form.formState.errors.formFields?.message

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className={styles.container()}>
        {/* Header */}
        <div className={styles.header()}>
          <Typography variant="body" size="xl" weight="bold">
            フォーム編集
          </Typography>
        </div>

        {/* Basic Info Section */}
        <div className={styles.section()}>
          <div className={styles.sectionHeader()}>
            <Typography variant="body" size="lg" weight="semibold">
              基本情報
            </Typography>
          </div>
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label="タイトル"
                required
                htmlFor={field.name}
                error={fieldState.error?.message}
              >
                <TextField
                  {...field}
                  id={field.name}
                  placeholder="例: お問い合わせフォーム"
                  error={!!fieldState.error}
                />
              </FormFieldWrapper>
            )}
          />

          <Controller
            control={form.control}
            name="purpose"
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label="フォームの目的"
                htmlFor={field.name}
                error={fieldState.error?.message}
              >
                <TextArea
                  {...field}
                  id={field.name}
                  value={field.value ?? ''}
                  placeholder="例: 製品に関するお問い合わせを受け付けるためのフォームです"
                  rows={3}
                  error={!!fieldState.error}
                />
              </FormFieldWrapper>
            )}
          />

          <Controller
            control={form.control}
            name="completionMessage"
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label="完了時メッセージ"
                htmlFor={field.name}
                error={fieldState.error?.message}
              >
                <TextArea
                  {...field}
                  id={field.name}
                  value={field.value ?? ''}
                  placeholder="例: お問い合わせありがとうございました。担当者より折り返しご連絡いたします。"
                  rows={2}
                  error={!!fieldState.error}
                />
              </FormFieldWrapper>
            )}
          />
        </div>

        {/* Form Fields Section */}
        <div className={styles.section()}>
          <Flex direction="row" justify="between" align="center">
            <Flex direction="column" gap={1}>
              <Typography variant="body" size="lg" weight="semibold">
                フォーム項目
              </Typography>
              {formFieldsRootError && (
                <Typography variant="alert" size="sm">
                  {formFieldsRootError}
                </Typography>
              )}
              {formFieldsError && (
                <Typography variant="alert" size="xs">
                  エラー: {formFieldsError}
                </Typography>
              )}
            </Flex>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSuggestFormFields}
              disabled={!form.watch('title') || isFormFieldsLoading}
            >
              {isFormFieldsLoading ? '生成中...' : 'AIで生成'}
            </Button>
          </Flex>

          <div className={styles.fieldList()}>
            {fields.map((field, index) => (
              <FormFieldItemRow
                key={field.id}
                index={index}
                control={form.control}
                fieldArrayName="formFields"
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
                placeholders={{
                  label: '例: 志望動機',
                  intent: '例: 応募者のモチベーションを確認する',
                  intentDescription: 'この質問で何を知りたいか',
                }}
              />
            ))}
          </div>

          <Flex>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ label: '', intent: '', required: false })}
            >
              <Flex align="center" gap={1}>
                <AddFill width={16} height={16} />
                <span>項目を追加</span>
              </Flex>
            </Button>
          </Flex>
        </div>

        {/* Footer */}
        <div className={styles.footer()}>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate({ to: '/forms/$formId', params: { formId } })}
          >
            キャンセル
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={mutation.isPending}>
            {mutation.isPending ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </form>
  )
}
