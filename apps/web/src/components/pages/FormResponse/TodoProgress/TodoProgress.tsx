import { Typography } from '@ding/ui'
import { todoProgress } from './const'
import type { TodoItem, TodoStatus } from '../type'

interface TodoProgressProps {
  todos: TodoItem[]
}

const STATUS_ICONS: Record<TodoStatus, string> = {
  done: '\u2713',
  awaiting_answer: '\u2026',
  validating: '\u2026',
  needs_clarification: '!',
  pending: '\u25CB',
  manual_input: '\u270E',
}

export function TodoProgress({ todos }: TodoProgressProps) {
  const styles = todoProgress()
  const requiredTodos = todos.filter((t) => t.required)
  const doneCount = requiredTodos.filter((t) => t.status === 'done').length
  const total = requiredTodos.length
  const progress = total > 0 ? (doneCount / total) * 100 : 0

  return (
    <div className={styles.container()}>
      <Typography variant="body" size="sm" weight="semibold" className={styles.title()}>
        {doneCount} / {total} 完了
      </Typography>

      <div className={styles.progressBar()}>
        <div className={styles.progressFill()} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.list()}>
        {todos.map((todo) => (
          <div key={todo.id} className={styles.item()}>
            <span className={todoProgress({ status: todo.status }).statusIcon()}>
              {STATUS_ICONS[todo.status]}
            </span>
            <Typography variant="body" size="xs" as="span">
              {todo.fact}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  )
}
