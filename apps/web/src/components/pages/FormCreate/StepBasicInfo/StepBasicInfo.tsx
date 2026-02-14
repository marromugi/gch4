import { FormFieldWrapper, TextArea, TextField } from '@ding/ui'
import { Controller, useFormContext } from '@/lib/hook-form'
import { stepBasicInfo } from './const'
import type { FormCreateFormValues } from '../type'

export function StepBasicInfo() {
  const styles = stepBasicInfo()
  const { control } = useFormContext<FormCreateFormValues>()

  return (
    <div className={styles.container()}>
      <Controller
        control={control}
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
        control={control}
        name="purpose"
        render={({ field, fieldState }) => (
          <FormFieldWrapper
            label="フォームの目的"
            description="AIがフィールドを提案する際の参考になります"
            htmlFor={field.name}
            error={fieldState.error?.message}
          >
            <TextArea
              {...field}
              value={field.value ?? ''}
              id={field.name}
              placeholder="例: 製品に関するお問い合わせを受け付けるためのフォームです"
              error={!!fieldState.error}
              rows={3}
            />
          </FormFieldWrapper>
        )}
      />

      <Controller
        control={control}
        name="completionMessage"
        render={({ field, fieldState }) => (
          <FormFieldWrapper
            label="完了時メッセージ"
            description="回答完了後に表示するメッセージ"
            htmlFor={field.name}
            error={fieldState.error?.message}
          >
            <TextArea
              {...field}
              value={field.value ?? ''}
              id={field.name}
              placeholder="例: お問い合わせありがとうございました。担当者より折り返しご連絡いたします。"
              error={!!fieldState.error}
              rows={2}
            />
          </FormFieldWrapper>
        )}
      />
    </div>
  )
}
