import { Button, FormFieldWrapper, TextArea, TextField, Typography } from '@ding/ui'
import { AddFill } from '@ding/ui/icon'
import { Flex } from '@ding/ui/layout'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import { Controller, useZodForm } from '@/lib/hook-form'
import {
  useIdealCandidateSuggest,
  useCultureContextSuggest,
} from '../JobCreate/StepCandidateProfile/hooks'
import { useFormFieldsSuggest } from '../JobCreate/StepFormFields/hooks'
import { jobEditPage } from './const'
import { FormFieldItemRow } from './FormFieldItem'
import { useJobEditData, useUpdateJobEditMutation } from './hook'
import { jobEditFormSchema } from './schema'
import type { JobEditFormValues, JobEditPageProps } from './type'
import type { JobFormField } from '../JobDetail/type'

export function JobEditPage({ jobId, className }: JobEditPageProps) {
  const styles = jobEditPage()
  const navigate = useNavigate()
  const { job, formFields, isLoading, isError } = useJobEditData(jobId)

  useEffect(() => {
    if (job && job.status !== 'draft') {
      navigate({ to: '/jobs/$jobId', params: { jobId } })
    }
  }, [job, jobId, navigate])

  if (isLoading) {
    return (
      <div className={styles.loadingState()}>
        <div className={styles.spinner()} />
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className={styles.loadingState()}>
        <Typography variant="alert" size="md">
          求人情報の取得に失敗しました
        </Typography>
      </div>
    )
  }

  if (job.status !== 'draft') {
    return null
  }

  return <JobEditForm jobId={jobId} job={job} formFields={formFields} className={className} />
}

interface JobEditFormProps {
  jobId: string
  job: { title: string; idealCandidate: string | null; cultureContext: string | null }
  formFields: JobFormField[]
  className?: string
}

function JobEditForm({ jobId, job, formFields: initialFormFields, className }: JobEditFormProps) {
  const styles = jobEditPage()
  const navigate = useNavigate()
  const mutation = useUpdateJobEditMutation(jobId)

  const form = useZodForm<JobEditFormValues>({
    schema: jobEditFormSchema,
    defaultValues: {
      title: job.title,
      idealCandidate: job.idealCandidate,
      cultureContext: job.cultureContext,
      formFields:
        initialFormFields.length > 0
          ? initialFormFields.map((f) => ({
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

  // AI suggest hooks
  const idealCandidate = useIdealCandidateSuggest()
  const cultureContext = useCultureContextSuggest()
  const {
    suggest: suggestFormFields,
    formFields: suggestedFields,
    isLoading: isFormFieldsLoading,
    error: formFieldsError,
  } = useFormFieldsSuggest()

  const isStreaming = idealCandidate.isStreaming || cultureContext.isStreaming

  const handleSuggestCandidateProfile = () => {
    if (isStreaming) {
      idealCandidate.cancel()
      cultureContext.cancel()
      return
    }
    const title = form.getValues('title')
    if (!title) return
    idealCandidate.suggest(title)
    cultureContext.suggest(title)
  }

  useEffect(() => {
    if (idealCandidate.text) {
      form.setValue('idealCandidate', idealCandidate.text)
    }
  }, [idealCandidate.text, form])

  useEffect(() => {
    if (cultureContext.text) {
      form.setValue('cultureContext', cultureContext.text)
    }
  }, [cultureContext.text, form])

  const handleSuggestFormFields = () => {
    const title = form.getValues('title')
    if (!title || isFormFieldsLoading) return
    suggestFormFields(title, form.getValues('idealCandidate'), form.getValues('cultureContext'))
  }

  useEffect(() => {
    if (suggestedFields) {
      replace(suggestedFields)
    }
  }, [suggestedFields, replace])

  const aiError = idealCandidate.error || cultureContext.error

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
            求人編集
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
                  placeholder="例: フロントエンドエンジニア"
                  error={!!fieldState.error}
                />
              </FormFieldWrapper>
            )}
          />
        </div>

        {/* Candidate Profile & Culture Section */}
        <div className={styles.section()}>
          <Flex direction="row" justify="between" align="center">
            <Flex direction="column" gap={1}>
              <Typography variant="body" size="lg" weight="semibold">
                理想人物像・カルチャー
              </Typography>
              {aiError && (
                <Typography variant="alert" size="xs">
                  エラー: {aiError}
                </Typography>
              )}
            </Flex>
            <Button
              type="button"
              variant={isStreaming ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleSuggestCandidateProfile}
              disabled={!isStreaming && !form.watch('title')}
            >
              {isStreaming ? '中止' : 'AIで自動生成'}
            </Button>
          </Flex>

          <Flex direction="column" gap={4}>
            <Controller
              control={form.control}
              name="idealCandidate"
              render={({ field, fieldState }) => (
                <FormFieldWrapper
                  label="理想の人物像"
                  description={
                    idealCandidate.isStreaming
                      ? '生成中...'
                      : 'どのような人材を求めているか記述してください'
                  }
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
                  description={
                    cultureContext.isStreaming
                      ? '生成中...'
                      : 'チームや会社のカルチャーについて記述してください'
                  }
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
          </Flex>
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
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
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
            onClick={() => navigate({ to: '/jobs/$jobId', params: { jobId } })}
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
