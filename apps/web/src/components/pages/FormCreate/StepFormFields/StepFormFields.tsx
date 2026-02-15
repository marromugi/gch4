import { Button, Typography } from '@ding/ui'
import { AddFill } from '@ding/ui/icon'
import { Flex } from '@ding/ui/layout'
import { useCallback, useEffect, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { FormFieldItemRow } from '@/components/common/FormFieldItem'
import { useFormContext } from '@/lib/hook-form'
import { DesignChatPanel, SlidePanel } from '../DesignChat'
import { stepFormFields } from './const'
import { useFormFieldsSuggest } from './hooks'
import type { GeneratedField } from '../DesignChat'
import type { FormCreateFormValues } from '../type'

export function StepFormFields() {
  const styles = stepFormFields()
  const { control, formState, watch } = useFormContext<FormCreateFormValues>()
  const [isDesignChatOpen, setIsDesignChatOpen] = useState(false)

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'formFields',
  })

  const title = watch('title')
  const purpose = watch('purpose')

  const { suggest, formFields: suggestedFields, isLoading, error } = useFormFieldsSuggest()

  const handleSuggest = () => {
    if (!title || isLoading) return
    suggest(title, purpose)
  }

  const handleOpenDesignChat = useCallback(() => {
    setIsDesignChatOpen(true)
  }, [])

  const handleDesignComplete = useCallback(
    (generatedFields: GeneratedField[]) => {
      const formFieldItems = generatedFields.map((field) => ({
        label: field.label,
        intent: field.intent ?? '',
        required: field.required,
        criteria: field.criteria,
        boundaries: field.boundaries?.map((b) => ({ value: b })),
      }))
      replace(formFieldItems)
      setIsDesignChatOpen(false)
    },
    [replace]
  )

  useEffect(() => {
    if (suggestedFields) {
      replace(suggestedFields)
    }
  }, [suggestedFields, replace])

  const formFieldsError =
    formState.errors.formFields?.root?.message ?? formState.errors.formFields?.message

  return (
    <div className={styles.container()}>
      <Flex direction="row" justify="between" align="center">
        <Flex direction="column" gap={1}>
          <Typography variant="body" size="sm" weight="medium">
            フォームの項目を定義してください
          </Typography>
          {formFieldsError && (
            <Typography variant="alert" size="sm">
              {formFieldsError}
            </Typography>
          )}
          {error && (
            <Typography variant="alert" size="xs">
              エラー: {error}
            </Typography>
          )}
        </Flex>
        <Flex gap={2}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenDesignChat}
            disabled={!purpose}
          >
            相談する
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSuggest}
            disabled={!title || isLoading}
          >
            {isLoading ? '生成中...' : 'AIで生成'}
          </Button>
        </Flex>
      </Flex>

      <SlidePanel
        open={isDesignChatOpen}
        onOpenChange={setIsDesignChatOpen}
        title="項目をつくる"
        closeOnOverlayClick={false}
      >
        {purpose && <DesignChatPanel purpose={purpose} onComplete={handleDesignComplete} />}
      </SlidePanel>

      <div className={styles.fieldList()}>
        {fields.map((field, index) => (
          <FormFieldItemRow
            key={field.id}
            index={index}
            control={control}
            fieldArrayName="formFields"
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>

      <div className={styles.addButton()}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => append({ label: '', intent: '', required: false })}
        >
          <Flex align="center" gap={1}>
            <AddFill width={16} height={16} />
            <span>項目を追加</span>
          </Flex>
        </Button>
      </div>
    </div>
  )
}
