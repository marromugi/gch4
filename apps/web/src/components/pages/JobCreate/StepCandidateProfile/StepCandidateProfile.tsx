import { Button, FormFieldWrapper, TextArea, Typography } from '@ding/ui'
import { Flex } from '@ding/ui/layout'
import { useEffect } from 'react'
import { Controller, useFormContext } from '@/lib/hook-form'
import { stepCandidateProfile } from './const'
import { useIdealCandidateSuggest, useCultureContextSuggest } from './hooks'
import type { JobCreateFormValues } from '../type'

export function StepCandidateProfile() {
  const styles = stepCandidateProfile()
  const { control, setValue, getValues } = useFormContext<JobCreateFormValues>()

  const idealCandidate = useIdealCandidateSuggest()
  const cultureContext = useCultureContextSuggest()

  const isStreaming = idealCandidate.isStreaming || cultureContext.isStreaming

  const handleSuggestAll = () => {
    if (isStreaming) {
      idealCandidate.cancel()
      cultureContext.cancel()
      return
    }
    const title = getValues('title')
    if (!title) return
    idealCandidate.suggest(title)
    cultureContext.suggest(title)
  }

  useEffect(() => {
    if (idealCandidate.text) {
      setValue('idealCandidate', idealCandidate.text)
    }
  }, [idealCandidate.text, setValue])

  useEffect(() => {
    if (cultureContext.text) {
      setValue('cultureContext', cultureContext.text)
    }
  }, [cultureContext.text, setValue])

  const error = idealCandidate.error || cultureContext.error

  return (
    <div className={styles.container()}>
      <Flex direction="row" justify="between" align="center">
        <Flex direction="column" gap={1}>
          <Typography variant="body" size="sm" weight="medium">
            AIアシスタント
          </Typography>
          {error && (
            <Typography variant="alert" size="xs">
              エラー: {error}
            </Typography>
          )}
        </Flex>
        <Button
          type="button"
          variant={isStreaming ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleSuggestAll}
          disabled={!isStreaming && !getValues('title')}
        >
          {isStreaming ? '中止' : 'AIで自動生成'}
        </Button>
      </Flex>

      <Controller
        control={control}
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
        control={control}
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
    </div>
  )
}
