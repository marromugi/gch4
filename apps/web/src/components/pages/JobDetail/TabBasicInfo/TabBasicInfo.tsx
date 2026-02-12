import { Box, Button, FormFieldWrapper, TextArea, TextField, Typography, useToast } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { useState } from 'react'
import { useZodForm, FormProvider, Controller } from '@/lib/hook-form'
import { useUpdateJobMutation } from '../hook'
import { jobEditFormSchema } from '../schema'
import { tabBasicInfo } from './const'
import type { JobDetail, JobEditFormValues } from '../type'

interface TabBasicInfoProps {
  job: JobDetail
  isDraft: boolean
}

export function TabBasicInfo({ job, isDraft }: TabBasicInfoProps) {
  const styles = tabBasicInfo()
  const [isEditing, setIsEditing] = useState(false)
  const { mutate: updateJob, isPending } = useUpdateJobMutation(job.id)
  const toast = useToast()

  const form = useZodForm({
    schema: jobEditFormSchema,
    defaultValues: {
      title: job.title,
      idealCandidate: job.idealCandidate,
      cultureContext: job.cultureContext,
    },
  })

  const handleSave = form.handleSubmit((data: JobEditFormValues) => {
    updateJob(
      { jobId: job.id, data },
      {
        onSuccess: () => {
          setIsEditing(false)
          toast.success('求人情報を更新しました')
        },
        onError: (error) => {
          toast.error((error as unknown as Error).message || '更新に失敗しました')
        },
      }
    )
  })

  const handleCancel = () => {
    form.reset({
      title: job.title,
      idealCandidate: job.idealCandidate,
      cultureContext: job.cultureContext,
    })
    setIsEditing(false)
  }

  if (isEditing && isDraft) {
    return (
      <FormProvider {...form}>
        <form onSubmit={handleSave}>
          <div className={styles.editForm()}>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormFieldWrapper
                  label="求人タイトル"
                  required
                  htmlFor={field.name}
                  error={fieldState.error?.message}
                >
                  <TextField
                    {...field}
                    id={field.name}
                    placeholder="例: フロントエンドエンジニア"
                    error={!!fieldState.error}
                  />
                </FormFieldWrapper>
              )}
            />
            <Controller
              control={form.control}
              name="idealCandidate"
              render={({ field, fieldState }) => (
                <FormFieldWrapper
                  label="理想の人物像"
                  htmlFor={field.name}
                  error={fieldState.error?.message}
                >
                  <TextArea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    placeholder="例: チームワークを大切にし、自走できるエンジニア"
                    rows={4}
                    error={!!fieldState.error}
                  />
                </FormFieldWrapper>
              )}
            />
            <Controller
              control={form.control}
              name="cultureContext"
              render={({ field, fieldState }) => (
                <FormFieldWrapper
                  label="カルチャー背景"
                  htmlFor={field.name}
                  error={fieldState.error?.message}
                >
                  <TextArea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    placeholder="例: フラットな組織で、オープンなコミュニケーションを重視"
                    rows={4}
                    error={!!fieldState.error}
                  />
                </FormFieldWrapper>
              )}
            />
            <Flex gap={2} className={styles.actions()}>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? '保存中...' : '保存'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={isPending}>
                キャンセル
              </Button>
            </Flex>
          </div>
        </form>
      </FormProvider>
    )
  }

  return (
    <div className={styles.container()}>
      <Box background="surface" border="muted" className="p-4 rounded-md">
        <Flex direction="column" gap={5}>
          <div className={styles.fieldGroup()}>
            <Typography variant="description" size="sm" weight="medium">
              求人タイトル
            </Typography>
            <Typography variant="body" size="md">
              {job.title}
            </Typography>
          </div>
          <div className={styles.fieldGroup()}>
            <Typography variant="description" size="sm" weight="medium">
              理想の人物像
            </Typography>
            <Typography variant="body" size="md">
              {job.idealCandidate || '未設定'}
            </Typography>
          </div>
          <div className={styles.fieldGroup()}>
            <Typography variant="description" size="sm" weight="medium">
              カルチャー背景
            </Typography>
            <Typography variant="body" size="md">
              {job.cultureContext || '未設定'}
            </Typography>
          </div>
        </Flex>
      </Box>
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
