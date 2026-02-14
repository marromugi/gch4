import {
  Box,
  Button,
  Checkbox,
  FormFieldWrapper,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextField,
  Typography,
  useToast,
} from '@ding/ui'
import { AddFill, DeleteFill, Required } from '@ding/ui/icon'
import { Flex } from '@ding/ui/layout'
import { useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useZodForm, FormProvider, Controller } from '@/lib/hook-form'
import { useFormFields, useSaveFormFieldsMutation } from '../hook'
import { formFieldsEditSchema, type FormFieldsEditValues } from '../schema'
import { tabFormFields } from './const'
import type { FormField } from '../type'

interface TabFormFieldsProps {
  formId: string
  isDraft: boolean
}

export function TabFormFields({ formId, isDraft }: TabFormFieldsProps) {
  const styles = tabFormFields()
  const [isEditing, setIsEditing] = useState(false)
  const { data: fields = [], isLoading } = useFormFields(formId, true)
  const { mutate: saveFields, isPending } = useSaveFormFieldsMutation(formId)
  const toast = useToast()

  const form = useZodForm({
    schema: formFieldsEditSchema,
    defaultValues: {
      fields:
        fields.length > 0
          ? fields.map((f: FormField) => ({
              id: f.id,
              fieldId: f.fieldId,
              label: f.label,
              intent: f.intent ?? '',
              required: f.required,
              sortOrder: f.sortOrder,
            }))
          : [{ label: '', intent: '', required: false, sortOrder: 0 }],
    },
  })

  const {
    fields: formFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'fields',
  })

  const handleStartEdit = () => {
    form.reset({
      fields:
        fields.length > 0
          ? fields.map((f: FormField) => ({
              id: f.id,
              fieldId: f.fieldId,
              label: f.label,
              intent: f.intent ?? '',
              required: f.required,
              sortOrder: f.sortOrder,
            }))
          : [{ label: '', intent: '', required: false, sortOrder: 0 }],
    })
    setIsEditing(true)
  }

  const handleSave = form.handleSubmit((data: FormFieldsEditValues) => {
    saveFields(
      {
        formId,
        data: {
          fields: data.fields.map((f: FormFieldsEditValues['fields'][number], i: number) => ({
            id: f.id ?? '',
            fieldId: f.fieldId ?? '',
            label: f.label,
            intent: f.intent,
            required: f.required,
            sortOrder: i,
          })),
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          toast.success('フォーム項目を更新しました')
        },
        onError: (error) => {
          toast.error((error as unknown as Error).message || 'フォーム項目の更新に失敗しました')
        },
      }
    )
  })

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Flex justify="center" className="py-8">
        <Typography variant="description">読み込み中...</Typography>
      </Flex>
    )
  }

  if (isEditing && isDraft) {
    return (
      <FormProvider {...form}>
        <form onSubmit={handleSave}>
          <div className={styles.editForm()}>
            <Typography variant="body" size="sm" weight="medium">
              応募フォームの項目を定義してください
            </Typography>
            {formFields.map((field, index) => (
              <Box
                key={field.id}
                background="surface"
                border="muted"
                className={styles.fieldItem()}
              >
                <Flex direction="column" gap={3}>
                  <Flex gap={3} align="end">
                    <div className="flex-1">
                      <Controller
                        control={form.control}
                        name={`fields.${index}.label`}
                        render={({ field: f, fieldState }) => (
                          <FormFieldWrapper
                            label="ラベル"
                            required
                            htmlFor={f.name}
                            error={fieldState.error?.message}
                          >
                            <TextField
                              {...f}
                              id={f.name}
                              placeholder="例: 自己紹介"
                              error={!!fieldState.error}
                            />
                          </FormFieldWrapper>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <Controller
                        control={form.control}
                        name={`fields.${index}.intent`}
                        render={({ field: f, fieldState }) => (
                          <FormFieldWrapper
                            label="意図"
                            htmlFor={f.name}
                            error={fieldState.error?.message}
                          >
                            <TextField
                              {...f}
                              id={f.name}
                              placeholder="例: 候補者の経験を把握する"
                              error={!!fieldState.error}
                            />
                          </FormFieldWrapper>
                        )}
                      />
                    </div>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Controller
                      control={form.control}
                      name={`fields.${index}.required`}
                      render={({ field: f }) => (
                        <Checkbox checked={f.value} onCheckedChange={f.onChange} label="必須" />
                      )}
                    />
                    {formFields.length > 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Flex align="center" gap={1}>
                          <DeleteFill width={16} height={16} />
                          <span>削除</span>
                        </Flex>
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Box>
            ))}
            <div className={styles.addButton()}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  append({ label: '', intent: '', required: false, sortOrder: formFields.length })
                }
              >
                <Flex align="center" gap={1}>
                  <AddFill width={16} height={16} />
                  <span>項目を追加</span>
                </Flex>
              </Button>
            </div>
            <Flex gap={2} className={styles.fieldActions()}>
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

  if (fields.length === 0) {
    return (
      <div className={styles.container()}>
        <Typography variant="description">フォーム項目が未設定です</Typography>
        {isDraft && (
          <div className="mt-4">
            <Button variant="secondary" onClick={handleStartEdit}>
              フォーム項目を追加
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container()}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ラベル</TableHead>
            <TableHead>意図</TableHead>
            <TableHead className="text-center">必須</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field: FormField) => (
            <TableRow key={field.id}>
              <TableCell className="font-medium">{field.label}</TableCell>
              <TableCell>{field.intent || '-'}</TableCell>
              <TableCell className="text-center">
                {field.required ? <Icon icon={Required} size={'xs'} /> : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isDraft && (
        <div className="mt-4">
          <Button variant="secondary" onClick={handleStartEdit}>
            編集
          </Button>
        </div>
      )}
    </div>
  )
}
