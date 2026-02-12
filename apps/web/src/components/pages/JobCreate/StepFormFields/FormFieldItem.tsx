import { Button, Checkbox, FormFieldWrapper, TextField } from '@ding/ui'
import { DeleteFill } from '@ding/ui/icon'
import { Flex } from '@ding/ui/layout'
import { Controller } from '@/lib/hook-form'
import { stepFormFields } from './const'
import type { JobCreateFormValues } from '../type'
import type { Control } from '@/lib/hook-form'

interface FormFieldItemProps {
  index: number
  control: Control<JobCreateFormValues>
  onRemove: () => void
  canRemove: boolean
}

export function FormFieldItemRow({ index, control, onRemove, canRemove }: FormFieldItemProps) {
  const styles = stepFormFields()

  return (
    <div className={styles.fieldItem()}>
      <div className={styles.fieldInputs()}>
        <Controller
          control={control}
          name={`formFields.${index}.label`}
          render={({ field, fieldState }) => (
            <FormFieldWrapper
              label="ラベル"
              required
              htmlFor={field.name}
              error={fieldState.error?.message}
            >
              <TextField
                {...field}
                id={field.name}
                placeholder="例: 志望動機"
                error={!!fieldState.error}
              />
            </FormFieldWrapper>
          )}
        />

        <Controller
          control={control}
          name={`formFields.${index}.intent`}
          render={({ field, fieldState }) => (
            <FormFieldWrapper
              label="意図"
              description="この質問で何を知りたいか"
              htmlFor={field.name}
              error={fieldState.error?.message}
            >
              <TextField
                {...field}
                id={field.name}
                placeholder="例: 応募者のモチベーションを確認する"
                error={!!fieldState.error}
              />
            </FormFieldWrapper>
          )}
        />

        <Controller
          control={control}
          name={`formFields.${index}.required`}
          render={({ field }) => (
            <Flex align="center">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="必須項目"
                size="sm"
              />
            </Flex>
          )}
        />
      </div>

      {canRemove && (
        <div className={styles.deleteButton()}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRemove}
            aria-label={`フォーム項目 ${index + 1} を削除`}
          >
            <DeleteFill width={18} height={18} />
          </Button>
        </div>
      )}
    </div>
  )
}
