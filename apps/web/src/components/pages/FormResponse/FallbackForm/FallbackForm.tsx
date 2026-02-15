import { Button, TextField, Typography } from '@ding/ui'
import { useState } from 'react'
import { fallbackForm } from './const'
import type { GetFormFields200DataItem } from '@/lib/api/generated/models'

export interface FallbackFormProps {
  /** フォームフィールド定義 */
  formFields: GetFormFields200DataItem[]
  /** 収集済みフィールド値 */
  collectedFields: Record<string, string>
  /** 未収集フィールドID */
  remainingFieldIds: string[]
  /** フォーム送信ハンドラ */
  onSubmit: (values: Record<string, string>) => void
  /** 送信中フラグ */
  isSubmitting?: boolean
}

/**
 * LLMエラー時のフォールバックフォーム
 *
 * 収集済みフィールドには値をプリフィルし、未収集フィールドは空欄で表示する
 */
export function FallbackForm({
  formFields,
  collectedFields,
  remainingFieldIds,
  onSubmit,
  isSubmitting = false,
}: FallbackFormProps) {
  const styles = fallbackForm()

  // フォーム値の状態管理
  const [values, setValues] = useState<Record<string, string>>(() => {
    // 初期値: 収集済みフィールドの値をセット、未収集は空文字
    return formFields.reduce(
      (acc, field) => {
        acc[field.fieldId] = collectedFields[field.fieldId] ?? ''
        return acc
      },
      {} as Record<string, string>
    )
  })

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container()}>
      <div className={styles.fieldList()}>
        {formFields.map((field) => {
          const isCollected = !remainingFieldIds.includes(field.fieldId)

          return (
            <div key={field.id} className={styles.fieldItem()}>
              <div className={styles.fieldLabel()}>
                <Typography variant="body" size="sm" weight="medium">
                  {field.label}
                  {field.required && (
                    <Typography variant="alert" size="xs" as="span" className="ml-1">
                      *
                    </Typography>
                  )}
                </Typography>
                {isCollected && <span className={styles.collectedBadge()}>収集済み</span>}
              </div>

              <TextField
                value={values[field.fieldId] ?? ''}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                placeholder={`${field.label}を入力`}
                disabled={isSubmitting}
                size="sm"
              />
            </div>
          )
        })}
      </div>

      <div className={styles.actions()}>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '送信する'}
        </Button>
      </div>
    </form>
  )
}
