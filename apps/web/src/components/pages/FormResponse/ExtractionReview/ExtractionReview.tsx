import { Box, Button, TextField, Typography } from '@ding/ui'
import { extractionReview } from './const'
import { useExtractionReview } from './hook'
import type { TodoItem } from '../type'

interface ExtractionReviewProps {
  todos: TodoItem[]
  onComplete: () => Promise<void>
}

export function ExtractionReview({ todos, onComplete }: ExtractionReviewProps) {
  const styles = extractionReview()
  const { reviewTodos, isSubmitting, handleSubmit } = useExtractionReview(todos, onComplete)

  return (
    <div className={styles.container()}>
      <Typography variant="body" size="lg" weight="bold" className={styles.title()}>
        入力内容の確認
      </Typography>

      <Typography variant="description" size="sm" as="p" className="mb-6">
        チャットで収集した情報を確認してください。内容に問題がなければ「確認して次へ」を押してください。
      </Typography>

      <div className={styles.fieldList()}>
        {reviewTodos.map((todo) => (
          <Box key={todo.id} className={styles.fieldItem()}>
            <Typography variant="body" size="sm" weight="medium" className={styles.fieldLabel()}>
              {todo.fact}
              {todo.required && (
                <Typography variant="alert" size="xs" as="span" className="ml-1">
                  *
                </Typography>
              )}
            </Typography>

            <TextField
              value={todo.extractedValue ?? ''}
              placeholder={todo.status === 'manual_input' ? '手動で入力してください' : ''}
              disabled
              size="sm"
            />
          </Box>
        ))}
      </div>

      <div className={styles.actions()}>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          確認して次へ
        </Button>
      </div>
    </div>
  )
}
