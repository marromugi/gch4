import { FormFieldWrapper, TextField } from '@ding/ui'
import { Controller, useFormContext } from '@/lib/hook-form'
import { stepBasicInfo } from './const'
import type { JobCreateFormValues } from '../type'

export function StepBasicInfo() {
  const styles = stepBasicInfo()
  const { control } = useFormContext<JobCreateFormValues>()

  return (
    <div className={styles.container()}>
      <Controller
        control={control}
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
    </div>
  )
}
