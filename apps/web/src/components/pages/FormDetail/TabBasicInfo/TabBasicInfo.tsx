import { Button, FormFieldWrapper, TextArea, TextField, Typography, useToast } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { useState } from 'react'
import { FormStatusBadge } from '@/components/common/FormStatusBadge'
import { useZodForm, FormProvider, Controller } from '@/lib/hook-form'
import { useUpdateFormMutation } from '../hook'
import { formEditFormSchema } from '../schema'
import { tabBasicInfo } from './const'
import type { FormDetail, FormEditFormValues } from '../type'

interface TabBasicInfoProps {
  form: FormDetail
  isDraft: boolean
  submissionCount: number
}

export function TabBasicInfo({ form, isDraft, submissionCount }: TabBasicInfoProps) {
  const styles = tabBasicInfo()
  const [isEditing, setIsEditing] = useState(false)
  const { mutate: updateForm, isPending } = useUpdateFormMutation(form.id)
  const toast = useToast()

  const formState = useZodForm({
    schema: formEditFormSchema,
    defaultValues: {
      title: form.title,
      purpose: form.purpose,
      completionMessage: form.completionMessage,
    },
  })

  const handleSave = formState.handleSubmit((data: FormEditFormValues) => {
    updateForm(
      { formId: form.id, data },
      {
        onSuccess: () => {
          setIsEditing(false)
          toast.success('フォーム情報を更新しました')
        },
        onError: () => {
          toast.error('更新に失敗しました')
        },
      }
    )
  })

  const handleCancel = () => {
    formState.reset({
      title: form.title,
      purpose: form.purpose,
      completionMessage: form.completionMessage,
    })
    setIsEditing(false)
  }

  if (isEditing && isDraft) {
    return (
      <div className={styles.container()}>
        {/* ステータス・応募者数セクション */}
        <div className={styles.statusRow()}>
          <div className={styles.statusItem()}>
            <Typography variant="description" size="sm" className={styles.statusLabel()}>
              ステータス
            </Typography>
            <FormStatusBadge status={form.status} />
          </div>
          <div className={styles.statusItem()}>
            <Typography variant="description" size="sm" className={styles.statusLabel()}>
              応募者数
            </Typography>
            <Typography variant="body" size="sm">
              {submissionCount}人
            </Typography>
          </div>
        </div>

        <FormProvider {...formState}>
          <form onSubmit={handleSave}>
            <div className={styles.editForm()}>
              <Controller
                control={formState.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FormFieldWrapper
                    label="フォームタイトル"
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
                control={formState.control}
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
                      rows={4}
                      error={!!fieldState.error}
                    />
                  </FormFieldWrapper>
                )}
              />
              <Controller
                control={formState.control}
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
                      rows={3}
                      error={!!fieldState.error}
                    />
                  </FormFieldWrapper>
                )}
              />
              <Flex gap={2} className={styles.actions()}>
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? '保存中...' : '保存'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  キャンセル
                </Button>
              </Flex>
            </div>
          </form>
        </FormProvider>
      </div>
    )
  }

  return (
    <div className={styles.container()}>
      {/* ステータス・応募者数セクション */}
      <div className={styles.statusRow()}>
        <div className={styles.statusItem()}>
          <Typography variant="description" size="sm" className={styles.statusLabel()}>
            ステータス
          </Typography>
          <FormStatusBadge status={form.status} />
        </div>
        <div className={styles.statusItem()}>
          <Typography variant="description" size="sm" className={styles.statusLabel()}>
            応募者数
          </Typography>
          <Typography variant="body" size="md">
            {submissionCount}人
          </Typography>
        </div>
      </div>

      {/* 基本情報カード */}
      <div className={styles.infoCard()}>
        <div className={styles.fieldGroup()}>
          <Typography variant="description" size="sm" weight="medium">
            フォームタイトル
          </Typography>
          <Typography variant="body" size="md">
            {form.title}
          </Typography>
        </div>
        <div className={styles.fieldGroup()}>
          <Typography variant="description" size="sm" weight="medium">
            フォームの目的
          </Typography>
          <Typography variant="body" size="md">
            {form.purpose || '未設定'}
          </Typography>
        </div>
        <div className={styles.fieldGroup()}>
          <Typography variant="description" size="sm" weight="medium">
            完了時メッセージ
          </Typography>
          <Typography variant="body" size="md">
            {form.completionMessage || '未設定'}
          </Typography>
        </div>
      </div>

      {isDraft && (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            編集
          </Button>
        </div>
      )}
    </div>
  )
}
