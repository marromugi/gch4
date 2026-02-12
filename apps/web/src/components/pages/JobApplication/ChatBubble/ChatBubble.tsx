import { Typography } from '@ding/ui'
import { chatBubble } from './const'
import type { MessageRole } from '../type'

interface ChatBubbleProps {
  content: string
  role: MessageRole
}

export function ChatBubble({ content, role }: ChatBubbleProps) {
  const styles = chatBubble({ role })

  return (
    <div className={styles.wrapper()}>
      <div className={styles.bubble()}>
        <Typography variant="body" size="sm" as="p">
          {content}
        </Typography>
      </div>
    </div>
  )
}
