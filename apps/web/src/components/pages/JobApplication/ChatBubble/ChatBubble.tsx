import { Typography } from '@ding/ui'
import { motion } from 'motion/react'
import { chatBubble } from './const'
import type { MessageRole } from '../type'

interface ChatBubbleProps {
  content: string
  role: MessageRole
}

export function ChatBubble({ content, role }: ChatBubbleProps) {
  const styles = chatBubble({ role })

  // roleに応じたスライド方向を決定
  const slideX = role === 'assistant' ? -20 : role === 'user' ? 20 : 0

  return (
    <motion.div
      className={styles.wrapper()}
      initial={{ opacity: 0, scale: 0.95, x: slideX }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className={styles.bubble()}>
        <Typography variant="body" size="sm" as="p">
          {content}
        </Typography>
      </div>
    </motion.div>
  )
}
