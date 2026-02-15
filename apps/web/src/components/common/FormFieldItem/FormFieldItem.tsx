import { Button, Checkbox, FormFieldWrapper, TextField, Typography } from '@ding/ui'
import { AddFill, ChevronRight, DeleteFill } from '@ding/ui/icon'
import { Flex } from '@ding/ui/layout'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Controller, useFieldArray } from '@/lib/hook-form'
import { formFieldItem } from './const'
import type { FormFieldItemRowProps } from './type'
import type { FieldValues } from '@/lib/hook-form'

const DEFAULT_PLACEHOLDERS = {
  label: '例: お名前',
  intent: '例: 連絡先として使用',
  intentDescription: 'この項目で何を収集したいか',
}

export function FormFieldItemRow<T extends FieldValues>({
  index,
  control,
  fieldArrayName,
  onRemove,
  canRemove,
  placeholders = {},
}: FormFieldItemRowProps<T>) {
  const styles = formFieldItem()
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const mergedPlaceholders = { ...DEFAULT_PLACEHOLDERS, ...placeholders }

  const {
    fields: criteriaFields,
    append: appendCriteria,
    remove: removeCriteria,
  } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: `${fieldArrayName}.${index}.criteria` as any,
  })

  const {
    fields: boundaryFields,
    append: appendBoundary,
    remove: removeBoundary,
  } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: `${fieldArrayName}.${index}.boundaries` as any,
  })

  return (
    <div className={styles.fieldItem()}>
      <div className={styles.fieldInputs()}>
        <Controller
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name={`${fieldArrayName}.${index}.label` as any}
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
                placeholder={mergedPlaceholders.label}
                error={!!fieldState.error}
              />
            </FormFieldWrapper>
          )}
        />

        <Controller
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name={`${fieldArrayName}.${index}.intent` as any}
          render={({ field, fieldState }) => (
            <FormFieldWrapper
              label="意図"
              description={mergedPlaceholders.intentDescription}
              htmlFor={field.name}
              error={fieldState.error?.message}
            >
              <TextField
                {...field}
                id={field.name}
                placeholder={mergedPlaceholders.intent}
                error={!!fieldState.error}
              />
            </FormFieldWrapper>
          )}
        />

        <Controller
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name={`${fieldArrayName}.${index}.required` as any}
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

        {/* 詳細設定トグル */}
        <button
          type="button"
          onClick={() => setIsDetailOpen(!isDetailOpen)}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
        >
          <motion.span animate={{ rotate: isDetailOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight width={16} height={16} />
          </motion.span>
          <span>詳細設定</span>
          {(criteriaFields.length > 0 || boundaryFields.length > 0) && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              ({criteriaFields.length}件の収集条件, {boundaryFields.length}件の禁止事項)
            </span>
          )}
        </button>

        <AnimatePresence>
          {isDetailOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
                {/* 収集条件 (criteria) */}
                <div className="space-y-2">
                  <Flex justify="between" align="center">
                    <Typography variant="body" size="sm" weight="medium">
                      収集条件
                    </Typography>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() =>
                        appendCriteria({
                          criteriaKey: `criteria_${criteriaFields.length + 1}`,
                          criteria: '',
                          doneCondition: '',
                          questioningHints: null,
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any)
                      }
                    >
                      <Flex align="center" gap={1}>
                        <AddFill width={14} height={14} />
                        <span>追加</span>
                      </Flex>
                    </Button>
                  </Flex>

                  {criteriaFields.map((criteriaField, criteriaIndex) => (
                    <div
                      key={criteriaField.id}
                      className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 space-y-2"
                    >
                      <Flex justify="between" align="center">
                        <Typography variant="body" size="xs" className="text-neutral-500">
                          条件 {criteriaIndex + 1}
                        </Typography>
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={() => removeCriteria(criteriaIndex)}
                        >
                          <DeleteFill width={14} height={14} />
                        </Button>
                      </Flex>

                      <Controller
                        control={control}
                        name={
                          `${fieldArrayName}.${index}.criteria.${criteriaIndex}.criteria` as any
                        }
                        render={({ field, fieldState }) => (
                          <FormFieldWrapper
                            label="収集すべき情報"
                            htmlFor={field.name}
                            error={fieldState.error?.message}
                          >
                            <TextField
                              {...field}
                              id={field.name}
                              placeholder="例: 希望年収の具体的な金額"
                              error={!!fieldState.error}
                              size="sm"
                            />
                          </FormFieldWrapper>
                        )}
                      />

                      <Controller
                        control={control}
                        name={
                          `${fieldArrayName}.${index}.criteria.${criteriaIndex}.doneCondition` as any
                        }
                        render={({ field, fieldState }) => (
                          <FormFieldWrapper
                            label="完了条件"
                            htmlFor={field.name}
                            error={fieldState.error?.message}
                          >
                            <TextField
                              {...field}
                              id={field.name}
                              placeholder="例: 具体的な金額が得られた"
                              error={!!fieldState.error}
                              size="sm"
                            />
                          </FormFieldWrapper>
                        )}
                      />

                      <Controller
                        control={control}
                        name={
                          `${fieldArrayName}.${index}.criteria.${criteriaIndex}.questioningHints` as any
                        }
                        render={({ field, fieldState }) => (
                          <FormFieldWrapper
                            label="質問ヒント"
                            description="質問時の参考情報（任意）"
                            htmlFor={field.name}
                            error={fieldState.error?.message}
                          >
                            <TextField
                              {...field}
                              value={field.value ?? ''}
                              id={field.name}
                              placeholder="例: 手取りではなく額面で聞く"
                              error={!!fieldState.error}
                              size="sm"
                            />
                          </FormFieldWrapper>
                        )}
                      />
                    </div>
                  ))}

                  {criteriaFields.length === 0 && (
                    <Typography
                      variant="body"
                      size="xs"
                      className="text-neutral-400 dark:text-neutral-500"
                    >
                      収集条件が設定されていません
                    </Typography>
                  )}
                </div>

                {/* 禁止事項 (boundaries) */}
                <div className="space-y-2">
                  <Flex justify="between" align="center">
                    <Typography variant="body" size="sm" weight="medium">
                      禁止事項
                    </Typography>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => appendBoundary({ value: '' } as any)}
                    >
                      <Flex align="center" gap={1}>
                        <AddFill width={14} height={14} />
                        <span>追加</span>
                      </Flex>
                    </Button>
                  </Flex>

                  {boundaryFields.map((boundaryField, boundaryIndex) => (
                    <Flex key={boundaryField.id} gap={2} align="center">
                      <Controller
                        control={control}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        name={`${fieldArrayName}.${index}.boundaries.${boundaryIndex}.value` as any}
                        render={({ field, fieldState }) => (
                          <div className="flex-1">
                            <TextField
                              {...field}
                              placeholder="例: 年齢を直接聞かない"
                              error={!!fieldState.error}
                              size="sm"
                            />
                          </div>
                        )}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => removeBoundary(boundaryIndex)}
                      >
                        <DeleteFill width={14} height={14} />
                      </Button>
                    </Flex>
                  ))}

                  {boundaryFields.length === 0 && (
                    <Typography
                      variant="body"
                      size="xs"
                      className="text-neutral-400 dark:text-neutral-500"
                    >
                      禁止事項が設定されていません
                    </Typography>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
