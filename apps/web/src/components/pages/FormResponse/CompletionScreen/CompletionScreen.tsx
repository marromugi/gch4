import { Typography } from '@ding/ui'
import { completionScreen } from './const'

interface CompletionScreenProps {
  submissionId: string
}

export function CompletionScreen({ submissionId }: CompletionScreenProps) {
  const styles = completionScreen()

  return (
    <div className={styles.container()}>
      <div className={styles.icon()}>&#10003;</div>

      <Typography variant="body" size="lg" weight="bold" className={styles.title()}>
        送信が完了しました
      </Typography>

      <Typography variant="description" size="sm" as="p" className="mb-6">
        ご回答ありがとうございます。内容を確認の上、ご連絡いたします。
      </Typography>

      <Typography variant="description" size="xs" as="p" className="mb-2">
        回答 ID
      </Typography>
      <span className={styles.submissionId()}>{submissionId}</span>
    </div>
  )
}
